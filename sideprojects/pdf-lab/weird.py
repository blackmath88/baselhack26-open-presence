"""Static layer logic and a legible bitmap half-adder. No PDF JavaScript."""
from build import shell, text
from exhibits import heading, setup, INK

def lock(state=0):
    p=shell(); groups=[p.add(f'<< /Type /OCG /Name ({n}) >>') for n in 'ABC']
    refs=' '.join(f'{r} 0 R' for r in groups)
    gate=p.add(f'<< /Type /OCMD /OCGs [{refs}] /P /AllOn /VE [/And 5 0 R [/Not 6 0 R] 7 0 R] >>')
    policies=['AnyOn','AllOn','AnyOff','AllOff']
    members=[p.add(f'<< /Type /OCMD /OCGs [{refs}] /P /{v} >>') for v in policies]
    s=heading('07','The lock is the layers panel.','Three switches. One expression. No JavaScript.')
    def panel(x,y,w,h,label,prop):
        base=f'0.90 0.92 0.95 rg {x} {y} {w} {h} re f\n'
        overlay=f'/OC /{prop} BDC 0.10 0.70 0.45 rg {x} {y} {w} {h} re f EMC\n'
        return base+overlay+INK+' rg\n'+text(x+12,y+15,label,14)
    for i,n in enumerate('ABC'):s+=panel(48+i*176,550,164,54,n,n)
    s+=panel(48,360,516,140,'A AND (NOT B) AND C','Gate')
    s+=INK+' rg\n'+text(48,523,'Green means visible. Grey means the conditional paint is absent.',11)
    s+=text(48,326,'Open the layers panel and find the combination. Inspect /VE to explain it.',11)
    for i,n in enumerate(policies):s+=panel(48+i*132,230,120,55,n,n)
    s+=text(48,194,'These four controls use /P policies. The large gate uses /VE.',11)
    s+=text(48,170,'Its /P fallback is AllOn: a different answer exposes ignored expressions.',11)
    s+=text(48,113,'Same page stream in all eight fixtures; only default layer states change.',11)
    s+=text(48,72,'Layers hide paint, not secrets. Viewer controls require separate qualification.',10)
    properties=' '.join(f'/{n} {r} 0 R' for n,r in zip(['A','B','C','Gate']+policies,groups+[gate]+members))
    setup(p,s,resources=f'/Properties << {properties} >>')
    on=' '.join(f'{r} 0 R' for i,r in enumerate(groups) if state & (4>>i))
    off=' '.join(f'{r} 0 R' for i,r in enumerate(groups) if not state & (4>>i))
    p.objects[0]=f'<< /Type /Catalog /Version /1.6 /Pages 2 0 R /PageMode /UseOC /OCProperties << /OCGs [{refs}] /D << /Name (Layer lock) /BaseState /OFF /ON [{on}] /OFF [{off}] /Order [{refs}] >> >> >>'
    return p.finish()

def bitmap():
    p=shell();s=heading('08','Pictures that add.','A toy bitmap machine, built entirely from NAND operations.')
    s+=INK+' rg\n'
    for i,line in enumerate(['N = NAND(A, B)','L = NAND(A, N)     R = NAND(B, N)','SUM = NAND(L, R)','CARRY = NAND(N, N)']):s+=text(48,590-i*38,line,18)
    s+=text(48,382,'A       B       SUM     CARRY',18)
    for row,(a,b) in enumerate([(0,0),(0,1),(1,0),(1,1)]):
        y=326-row*46
        for col,value in enumerate([a,b,a^b,a&b]):
            x=48+col*108;s+=('0.10 0.70 0.45' if value else '0.90 0.92 0.95')+f' rg {x} {y} 32 32 re f\n'+INK+' rg\n'+text(x+11,y+10,str(value),14)
    s+=text(48,114,'In the workbench, every pixel is an independent one-bit half-adder.',11)
    s+=text(48,88,'This is our own Boolean simulator, not JBIG2 and not an exploit reproduction.',10)
    return setup(p,s)

def colour_program():
    p=shell()
    # Type 4 calculator function: x y -> v (1-v) 0.35, v in [0,1].
    program='{ 1440 mul cos exch 2160 mul sin mul 1 add 2 div dup 1 exch sub 0.35 }'
    function=p.stream(program,'/FunctionType 4 /Domain [0 1 0 1] /Range [0 1 0 1 0 1]')
    shading=p.add(f'<< /ShadingType 1 /ColorSpace /DeviceRGB /Domain [0 1 0 1] /Matrix [516 0 0 430 48 176] /Function {function} 0 R >>')
    s=heading('09','The colour is a program.','A tiny stack language computes the paint. No PDF JavaScript.')
    s+='q /Wave sh Q\n'+INK+' rg\n'
    s+=text(48,140,'v = (sin(2160x) * cos(1440y) + 1) / 2   [angles in degrees]',11)
    s+=text(48,113,'RGB = (v, 1-v, 0.35). The page stores a function, not this pixel grid.',11)
    s+=text(48,72,'Inspect /FunctionType 4 and /ShadingType 1. Sampling belongs to the reader.',10)
    return setup(p,s,resources=f'/Shading << /Wave {shading} 0 R >>')

def generate():
    return {**{f'07-layer-lock-{state:03b}.pdf':lock(state) for state in range(8)},'08-bitmap-machine.pdf':bitmap(),'09-colour-program.pdf':colour_program()}
