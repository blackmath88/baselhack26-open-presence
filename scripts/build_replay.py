"""Reconstruct a bounded repository replay from Git; no API or credentials."""
import json
import os
from pathlib import Path
import subprocess


def git(*args):
    return subprocess.check_output(['git', *args]).decode('utf-8', 'replace')


def collect(repository):
    commits = git('rev-list', '--first-parent', '--max-count=200', 'HEAD').splitlines()[::-1]
    events = []
    previous = set()
    for i, sha in enumerate(commits):
        files = set(filter(None, git('ls-tree', '-r', '--name-only', '-z', sha).split('\0')))
        timestamp, title = git('show', '-s', '--format=%cI%n%s', sha).split('\n', 1)
        changed = set(filter(None, git('diff', '--name-only', '-z', commits[i-1], sha).split('\0'))) if i else set()
        events.append(dict(schema='presence.repo-event/v1', id=sha, ts=timestamp,
                           kind='baseline' if i == 0 else 'commit', title=title.strip(),
                           url=f'https://github.com/{repository}/commit/{sha}',
                           files=sorted(files), added=sorted(files - previous) if i else [],
                           removed=sorted(previous - files), changed=sorted(changed & files)))
        previous = files
    return events


if __name__ == '__main__':
    output = Path('observstory')
    output.mkdir(exist_ok=True)
    events = collect(os.environ.get('GITHUB_REPOSITORY', 'blackmath88/baselhack26-open-presence'))
    (output / 'repo-events.jsonl').write_text(''.join(json.dumps(e) + '\n' for e in events))
    template = Path('replay/index.html').read_text()
    payload = json.dumps(events).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    (output / 'replay.html').write_text(template.replace('__EVENTS__', payload))
    index = output / 'index.html'
    if index.exists():
        html = index.read_text()
        link = '<nav aria-label="Repository replay" style="padding:12px"><a href="replay.html">Replay repository history ↗</a></nav>'
        import re
        index.write_text(re.sub(r'(<body\b[^>]*>)', lambda m: m[0] + link, html, count=1))
