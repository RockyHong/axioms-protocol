import sys,glob
from PIL import Image, ImageDraw
fs=sorted(glob.glob('stills/*.png'), key=lambda f: float(f[8:-4]))
fs=[f for f in fs if (lo:=float(sys.argv[1]))<=float(f[8:-4])<=float(sys.argv[2])]
wide=Image.open(fs[0]).width>Image.open(fs[0]).height             # 16:9 pieces (KEYNOTE) get landscape tiles
w,h=(480,270) if wide else (270,480); cols=min(len(fs),4 if wide else 5); rows=(len(fs)+cols-1)//cols
S=Image.new('RGB',(cols*w,rows*(h+24)),'white'); d=ImageDraw.Draw(S)
for i,f in enumerate(fs):
    im=Image.open(f).resize((w,h)); x,y=(i%cols)*w,(i//cols)*(h+24); S.paste(im,(x,y+24)); d.text((x+4,y+4),f[7:-4],fill='black')
S.save(sys.argv[3])
