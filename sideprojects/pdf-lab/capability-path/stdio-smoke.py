"""Local protocol client: real OS pipes (also works where Node child socket stdio is restricted)."""
import base64
import hashlib
import json
from pathlib import Path
import select
import subprocess
import sys

process = subprocess.Popen([sys.argv[1], str(Path(__file__).with_name('stdio.mjs'))], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=None, text=True)
sequence = 0

def request(method, params):
    global sequence
    sequence += 1
    process.stdin.write(json.dumps(dict(jsonrpc='2.0', id=sequence, method=method, params=params)) + '\n')
    process.stdin.flush()
    assert select.select([process.stdout], [], [], 15)[0], f'{method}: timed out'
    line = process.stdout.readline()
    assert line, f'{method}: server closed unexpectedly'
    response = json.loads(line)
    assert response.get('id') == sequence and 'error' not in response, response
    return response['result']

def call(name, arguments=None):
    result = request('tools/call', dict(name=name, arguments=arguments or {}))
    assert not result.get('isError'), result
    return json.loads(result['content'][0]['text'])

try:
    request('initialize', dict(protocolVersion='2025-03-26', capabilities={}, clientInfo=dict(name='pdf-lab-python-smoke', version='1.0.0')))
    process.stdin.write(json.dumps(dict(jsonrpc='2.0', method='notifications/initialized')) + '\n')
    process.stdin.flush()
    assert len(request('tools/list', {})['tools']) == 5
    capabilities = call('get_capabilities')
    project = call('get_example', dict(capability=capabilities['modules'][0]['id']))
    assert call('validate_project', project)['valid']
    manifest = call('render_project', project)
    pdf = call('retrieve_artifact', dict(renderId=manifest['renderId'], artifactId='poem.pdf'))
    data = base64.b64decode(pdf['data'], validate=True)
    assert data.startswith(b'%PDF-1.4')
    assert data == Path(pdf['path']).read_bytes()
    assert len(data) == pdf['size'] and hashlib.sha256(data).hexdigest() == pdf['sha256']
    invalid = request('tools/call', dict(name='render_project', arguments={**project, 'version': 2}))
    assert invalid['isError'], invalid
    print(json.dumps(dict(status='passed', tools=5, sha256=pdf['sha256'], size=pdf['size'])))
finally:
    process.stdin.close()
    try:
        process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait()
