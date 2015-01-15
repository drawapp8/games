# -*- coding: utf-8 -*-

'''

'''

import json
from copy import deepcopy


def genFontJson():
    input_image_name = 'num_level.png'
    input_image_w = 21
    input_image_h = 297
    input_direction = 'shu'  # 'heng'
    input_chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '/']

    META = {
    "app": "http://www.codeandweb.com/texturepacker",
    "version": "1.0",
    "image": input_image_name,
    "format": "RGBA8888",
    "size": {"w": input_image_w, "h": input_image_h},
    "scale": "1",
    "smartupdate": "$TexturePacker:SmartUpdate:06753790ee884ada054491f666ef881a:86b4e74be3d6d1c63d269f57e566917b:033b907575d6c9e03ca7456ba6766d50$"
    }

    if input_direction == 'heng':
        char_w = input_image_w / len(input_chars)
        char_h = input_image_h
    else:
        char_w = input_image_w
        char_h = input_image_h / len(input_chars)

    CHAR_DATA = {
    "frame": {"x": 0, "y": 0, "w": char_w, "h": char_h},
    "rotated": False,
    "trimmed": False,
    "spriteSourceSize": {"x": 0, "y": 0, "w": char_w, "h": char_h},
    "sourceSize": {"w": char_w, "h": char_h},
    "pivot": {"x": 0.5, "y": 0.5}
    }

    font = {'meta': META, 'frames': {}}

    for i in range(len(input_chars)):
        x = 0
        y = 0
        if input_direction == 'heng':
            x = i * char_w
        elif input_direction == 'shu':
            y = i * char_h
        else:
            assert False

        char_data = deepcopy(CHAR_DATA)
        char_data['frame']['x'] = x
        char_data['frame']['y'] = y
        font['frames'][input_chars[i]] = char_data
        # print '"%s" \n %s' % (input_chars[i], char_data)

    font_json = json.dumps(font, indent=4, sort_keys=True)

    fname = input_image_name
    for i in range(len(fname)):
        if fname[i] == '.':
            fname = fname[0:i] + '.json'
    fname = './font/%s' % fname

    with open(fname, 'w') as f:
        f.write(font_json)
        print 'write "%s" success' % fname


if __name__ == "__main__":
    genFontJson()