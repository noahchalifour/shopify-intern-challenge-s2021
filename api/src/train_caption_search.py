import os
import json
import collections
import random
import numpy as np
import tensorflow as tf

from app.utils import text_encoding
from app.utils import image_search


def get_data():

    # Download caption annotation files
    annotation_folder = '/annotations/'
    if not os.path.exists(os.path.abspath('.') + annotation_folder):
        annotation_zip = tf.keras.utils.get_file('captions.zip',
            cache_subdir=os.path.abspath('.'),
            origin='http://images.cocodataset.org/annotations/annotations_trainval2014.zip',
            extract=True)
        annotation_file = os.path.dirname(annotation_zip) + '/annotations/captions_train2014.json'
        os.remove(annotation_zip)
    else:
        annotation_file = './annotations/captions_train2014.json'

    # Download image files
    image_folder = '/train2014/'
    if not os.path.exists(os.path.abspath('.') + image_folder):
        image_zip = tf.keras.utils.get_file('train2014.zip',
            cache_subdir=os.path.abspath('.'),
            origin='http://images.cocodataset.org/zips/train2014.zip',
            extract=True)
        PATH = os.path.dirname(image_zip) + image_folder
        os.remove(image_zip)
    else:
        PATH = os.path.abspath('.') + image_folder

    with open(annotation_file, 'r') as f:
        annotations = json.load(f)

    # Group all captions together having the same image ID.
    image_path_to_caption = collections.defaultdict(list)
    for val in annotations['annotations']:
        caption = val['caption']
        image_path = PATH + 'COCO_train2014_' + '%012d.jpg' % (val['image_id'])
        image_path_to_caption[image_path].append(caption)

    image_paths = list(image_path_to_caption.keys())
    random.shuffle(image_paths)

    # Select the first 6000 image_paths from the shuffled set.
    # Approximately each image id has 5 captions associated with it, so that will 
    # lead to 30,000 examples.
    train_image_paths = image_paths[:6000]
    # print(len(train_image_paths))

    train_captions = []
    img_name_vector = []

    for image_path in train_image_paths:
        caption_list = image_path_to_caption[image_path]
        train_captions.extend(caption_list)
        img_name_vector.extend([image_path] * len(caption_list))

    return img_name_vector, train_captions


def cache_image_features(img_names, encode_fn):

    # Get unique images
    encode_train = sorted(set(img_names))

    # Feel free to change batch_size according to your system configuration
    image_dataset = tf.data.Dataset.from_tensor_slices(encode_train)
    image_dataset = image_dataset.map(
        lambda path: (encode_fn(path), path), 
        num_parallel_calls=tf.data.AUTOTUNE).batch(16)

    for img, path in image_dataset:
        # batch_features = image_features_extract_model(img)
        # batch_features = tf.reshape(batch_features,
        #                             (batch_features.shape[0], -1, batch_features.shape[3]))

        # for bf, p in zip(batch_features, path):
        #     path_of_feature = p.numpy().decode("utf-8")
        #     np.save(path_of_feature, bf.numpy())
        path_of_feature = path.numpy().decode("utf-8")
        np.save(path_of_feature, img.numpy())


def main():

    text_encoder = text_encoding.build_encoder()
    image_search.init_image_encoder()

    img_names, captions = get_data()
    cache_image_features(img_names,
        image_search.encode_image)


if __name__ == '__main__':

    main()