import { createServer, request as proxyRequest } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root=resolve(process.argv[2]), port=Number(process.argv[3]);
const proxy=process.argv.includes('--commons');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.pdf':'application/pdf','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain','.py':'text/plain'};
createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(proxy && (url.pathname==='/api' || url.pathname.startsWith('/api/') || url.pathname==='/mcp')){
    const upstream=proxyRequest({hostname:'127.0.0.1',port:8787,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:8787'}},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res)});
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'content-type':'application/json'});res.end('{"error":"service_unavailable"}')});req.pipe(upstream);return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
  let p;try{p=decodeURIComponent(url.pathname)}catch{res.writeHead(400).end();return}
  let file=resolve(root,'.'+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}
  try{if(statSync(file).isDirectory())file=resolve(file,'index.html');if(!statSync(file).isFile())throw Error();}
  catch{res.writeHead(404).end('Not found');return}
  res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','x-content-type-options':'nosniff'});
  if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log('Serving',root,'on http://127.0.0.1:'+port));
