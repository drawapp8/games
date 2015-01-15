# -*- coding: utf-8 -*-

'''

# --- 产生切图json文件(格式: texturePacker json hash) ---

#用途比如：多格漫画切图
#1 - 2 - 3
# 4 - 5

'''

import json
from copy import deepcopy

LAST_ONE = -1

IMAGE_NAME = 'comic.jpg'
IMAGE_WIDTH = 720
IMAGE_HEIGHT = 480
LINE1_HEIGHT = 228
LINE1_WIDTH_LIST = [275, LAST_ONE]
LINE2_WIDTH_LIST = [521, LAST_ONE]

line2_height = IMAGE_HEIGHT - LINE1_HEIGHT

META_DATA = {
    "app": "http://www.codeandweb.com/texturepacker",
    "version": "1.0",
    "image": IMAGE_NAME,
    "format": "RGBA8888",
    "size": {"w": IMAGE_WIDTH, "h": IMAGE_HEIGHT},
    "scale": "1",
    "smartupdate": "$TexturePacker:SmartUpdate:06753790ee884ada054491f666ef881a:86b4e74be3d6d1c63d269f57e566917b:033b907575d6c9e03ca7456ba6766d50$"
}

ITEM_TEMPLATE = {
    "frame": {"x": 0, "y": 0, "w": 0, "h": 0},
    "rotated": False,
    "trimmed": False,
    "spriteSourceSize": {"x": 0, "y": 0, "w": 0, "h": 0},
    "sourceSize": {"w": 0, "h": 0},
    "pivot": {"x": 0.5, "y": 0.5}
}


def parse_width(width_list):
    w_total = 0
    for i in range(len(width_list)):
        if width_list[i] == LAST_ONE:
            width_list[i] = IMAGE_WIDTH - w_total
        else:
            w_total += width_list[i]
    #print width_list


def append_line_item(regin_info, begin_index, line_width_list, line_height):
    w_add = 0
    for i in range(len(line_width_list)):
        item = deepcopy(ITEM_TEMPLATE)
        w = line_width_list[i]

        item['frame']['x'] = w_add
        if begin_index > 0:
            item['frame']['y'] = LINE1_HEIGHT
        item['frame']['w'] = w
        item['frame']['h'] = line_height
        item['spriteSourceSize']['w'] = w
        item['spriteSourceSize']['h'] = line_height
        item['sourceSize']['w'] = w
        item['sourceSize']['h'] = line_height

        regin_info['frames'][str(i + begin_index)] = item
        w_add += w


def get_filename_by_suffix(file_name, suffix):
    for i in range(len(file_name)):
        if file_name[i] == '.':
            return file_name[0:i] + suffix


def gen_splite_json():
    parse_width(LINE1_WIDTH_LIST)
    parse_width(LINE2_WIDTH_LIST)
    region_info = {'meta': META_DATA, 'frames': {}}
    append_line_item(region_info, 0, LINE1_WIDTH_LIST, LINE1_HEIGHT)
    append_line_item(region_info, len(LINE1_WIDTH_LIST), LINE2_WIDTH_LIST, line2_height)

    json_fname = get_filename_by_suffix(IMAGE_NAME, '.json')
    with open('.\image\%s' % json_fname, 'w') as f:
        f.write(json.dumps(region_info, indent=4, sort_keys=True))
        print 'write %s success' % json_fname


if __name__ == "__main__":
    gen_splite_json()