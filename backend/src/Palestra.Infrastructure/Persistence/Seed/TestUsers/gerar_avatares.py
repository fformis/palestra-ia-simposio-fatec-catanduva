#!/usr/bin/env python3
"""Gera os 100 avatares ilustrados dos usuários de teste (spec 006).

Uso:  python3 gerar_avatares.py            (requer Pillow; roda fora do build)
Lê users.json (campo "avatar" de cada usuário) e grava photos/NNN.png (256x256).
Determinístico: mesma entrada -> mesmos bytes. Ilustrações próprias do projeto,
dedicadas ao domínio público (CC0). Não representam nenhuma pessoa real.
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw

AQUI = Path(__file__).parent
SS, OUT = 4, 256          # supersampling
W = OUT * SS

SKIN = ['#fde3cf', '#f6cfae', '#e8b48a', '#d29a6e', '#b97a50', '#98603a', '#7a4a2b', '#5a3320']
HAIR = ['#1b1512', '#3b2417', '#5a3a22', '#8a5a2f', '#d9b36a', '#b0452b', '#b8b8bd']
BG = ['#cfe8ff', '#d9f2e3', '#ffe8c7', '#f6d6e4', '#e2dcff', '#d6f0f0', '#fff3b8', '#ffd9cf', '#dfe6ee', '#e6f2c9']
SHIRT = ['#2f5d8a', '#2e7d5b', '#b34a4a', '#6a4c93', '#d08a2e', '#3a3f4b', '#1f8a8a', '#a0527c']
DARK = '#241a14'


def s(v):
    return v * SS


def ell(d, cx, cy, rx, ry, fill, outline=None, width=0):
    d.ellipse([s(cx - rx), s(cy - ry), s(cx + rx), s(cy + ry)], fill=fill, outline=outline, width=s(width))


def draw_hair_back(d, style, c):
    if style == 'long':
        d.rounded_rectangle([s(64), s(56), s(192), s(214)], radius=s(48), fill=c)
    elif style == 'bob':
        d.rounded_rectangle([s(64), s(56), s(192), s(160)], radius=s(44), fill=c)
    elif style == 'bun':
        ell(d, 128, 40, 22, 22, c)
    elif style == 'afro':
        ell(d, 128, 92, 70, 68, c)
    elif style == 'curly':
        for cx, cy in [(78, 92), (98, 62), (128, 52), (158, 62), (178, 92), (72, 120), (184, 120)]:
            ell(d, cx, cy, 24, 24, c)


def draw_hair_front(d, style, c):
    if style == 'bald':
        return
    # base da franja/topo
    if style in ('short', 'side', 'bob', 'long', 'bun', 'curly', 'afro'):
        d.pieslice([s(76), s(54), s(180), s(140)], 180, 360, fill=c)
    if style == 'buzz':
        d.pieslice([s(80), s(60), s(176), s(132)], 180, 360, fill=c)
    if style == 'side':
        d.polygon([(s(80), s(96)), (s(128), s(70)), (s(176), s(100)), (s(176), s(82)), (s(128), s(56)), (s(80), s(82))], fill=c)
    if style in ('long', 'bob'):
        d.polygon([(s(84), s(96)), (s(110), s(82)), (s(150), s(82)), (s(172), s(96)), (s(172), s(70)), (s(84), s(70))], fill=c)


def draw_avatar(av):
    img = Image.new('RGB', (W, W), BG[av['bg']])
    d = ImageDraw.Draw(img)
    ell(d, 128, 128, 120, 120, BG[av['bg']])
    skin, hair = SKIN[av['skin']], HAIR[av['hairColor']]
    # ombros / camisa
    d.rounded_rectangle([s(48), s(196), s(208), s(300)], radius=s(48), fill=SHIRT[av['shirt']])
    # pescoço
    d.rectangle([s(112), s(158), s(144), s(206)], fill=skin)
    d.rectangle([s(112), s(158), s(144), s(172)], fill=tuple(max(0, int(skin[i:i + 2], 16) - 24) for i in (1, 3, 5)))
    draw_hair_back(d, av['hair'], hair)
    # orelhas e cabeça
    ell(d, 83, 118, 9, 13, skin)
    ell(d, 173, 118, 9, 13, skin)
    ell(d, 128, 112, 46, 54, skin)
    draw_hair_front(d, av['hair'], hair)
    # rosto
    ell(d, 108, 116, 5, 6, DARK)
    ell(d, 148, 116, 5, 6, DARK)
    d.line([s(98), s(102), s(116), s(100)], fill=DARK, width=s(3))
    d.line([s(140), s(100), s(158), s(102)], fill=DARK, width=s(3))
    d.arc([s(108), s(128), s(148), s(158)], 20, 160, fill=DARK, width=s(4))
    acc = av['accessory']
    if 'beard' in acc:
        d.pieslice([s(84), s(100), s(172), s(176)], 10, 170, fill=hair)
        d.arc([s(108), s(128), s(148), s(158)], 20, 160, fill=skin, width=s(10))
        d.arc([s(112), s(130), s(144), s(152)], 20, 160, fill=DARK, width=s(3))
    if 'glasses' in acc:
        for cx in (108, 148):
            ell(d, cx, 116, 15, 12, None, outline=DARK, width=3)
        d.line([s(123), s(115), s(133), s(115)], fill=DARK, width=s(3))
    if acc == 'cap':
        d.pieslice([s(78), s(50), s(178), s(130)], 180, 360, fill='#2b2f3a')
        d.rounded_rectangle([s(70), s(84), s(150), s(94)], radius=s(5), fill='#2b2f3a')
    if acc == 'headphones':
        d.arc([s(76), s(52), s(180), s(150)], 180, 360, fill='#30343f', width=s(9))
        d.rounded_rectangle([s(70), s(104), s(88), s(136)], radius=s(7), fill='#30343f')
        d.rounded_rectangle([s(168), s(104), s(186), s(136)], radius=s(7), fill='#30343f')
    return img.resize((OUT, OUT), Image.LANCZOS)


def main():
    users = json.loads((AQUI / 'users.json').read_text(encoding='utf-8'))['users']
    pasta = AQUI / 'photos'
    pasta.mkdir(exist_ok=True)
    for u in users:
        draw_avatar(u['avatar']).save(pasta / f"{u['n']:03d}.png", optimize=True)
    print(f'{len(users)} avatares gerados em {pasta}')


if __name__ == '__main__':
    main()
