# -*- coding: utf-8 -*-

'''

# --- 产生图片字体切图json文件(格式: texturePacker json hash) ---

示例：
genImageFontJson.py font.info

#限制: 字体排列必须是一行或者一列，多行多列不支持(可以使用 genImageRegionJson.py)

'''

import json
import sys
import os
from copy import deepcopy

META_DATA = {
    "app": "http://www.codeandweb.com/texturepacker",
    "version": "1.0",
    "image": "",
    "format": "RGBA8888",
    "size": {"w": 0, "h": 0},
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


def parse_width_lists(width_lists, image_width):
    for width_list in width_lists:
        w_total = 0
        for i in range(len(width_list)):
            if width_list[i] == LAST_ONE:
                width_list[i] = image_width - w_total
            else:
                w_total += width_list[i]
    return width_lists


def append_row_items(regin_info, item_bgin_index, item_width_list, row_height, row_y):
    x_addup = 0
    item_index = 0
    for i in range(len(item_width_list)):
        item = deepcopy(ITEM_TEMPLATE)
        item_width_list[i]

        item['frame']['x'] = x_addup
        item['frame']['y'] = row_y
        item['frame']['w'] = item_width_list[i]
        item['frame']['h'] = row_height
        item['spriteSourceSize']['w'] = item_width_list[i]
        item['spriteSourceSize']['h'] = row_height
        item['sourceSize']['w'] = item_width_list[i]
        item['sourceSize']['h'] = row_height

        item_index = item_bgin_index + i
        regin_info['frames'][str(item_index)] = item
        x_addup += item_width_list[i]
        
    return item_index


def get_filename_replace_suffix(file_name, suffix):
    for i in range(len(file_name)):
        if file_name[i] == '.':
            return file_name[0:i] + suffix


def read_info(info_fname):
    with open(info_fname, 'r') as f:
        try:
            return json.load(f)
        except:
            pass


def gen_region_data(info):
    if info['DIRECTION'] == 'h':
        char_w = info['IMAGE_WIDTH'] / len(info['CHARS'])
        char_h = info['IMAGE_HEIGHT']
        width_list = [char_w for char in info['CHARS']]
        width_lists = [width_list]
        height_list = [char_h]        
    elif info['DIRECTION'] == 's':
        char_h = info['IMAGE_HEIGHT'] / len(info['CHARS'])
        char_w = info['IMAGE_WIDTH']        
        width_lists = [[char_w] for char in info['CHARS']]
        height_list = [char_h for char in info['CHARS']]
    else:
        print 'info error: DIRECTION must "s" or "h"'
    #print char_w, char_h
    #print width_lists
    #print height_list
    #return
    
    meta_data = META_DATA
    meta_data['image'] = info['IMAGE_NAME']
    meta_data['size']['w'] = info['IMAGE_WIDTH']
    meta_data['size']['h'] = info['IMAGE_HEIGHT']

    region_data = {'meta': meta_data, 'frames': {}}

    y_addup = 0
    begin_index = 0
    for row_index in range(len(width_lists)):
        begin_index = 1 + append_row_items(region_data, 
            begin_index, width_lists[row_index], height_list, y_addup)        
        y_addup += height_list[row_index]

    json_fname = get_filename_replace_suffix(info['IMAGE_NAME'], '.json')
    with open(json_fname, 'w') as f:
        f.write(json.dumps(region_data, indent=4, sort_keys=True))
        print 'write %s success' % json_fname


def main(info_fname):    
    if not info_fname:
        print "Usage: genImageRegionJson [info]"
        return

    info = read_info(info_fname)
    if not info:
        print "info format is invalid!"

    gen_region_data(info)

if __name__ == "__main__":
    fn = './sample/font.info'
    #fn = sys.argv[1]    
    main(fn)