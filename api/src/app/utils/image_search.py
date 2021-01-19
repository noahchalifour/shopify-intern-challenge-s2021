from scipy import spatial
from sklearn.neighbors import NearestNeighbors
import tensorflow as tf
import tensorflow_hub as hub


IMAGE_ENCODER = None
ALL_IMGS = []
NN = None
INITIALIZED = False
MAX_NEIGHBORS = 100


def initialize():

    global INITIALIZED

    print('Initializing image encoder...')
    init_image_encoder()
    print('Image encoder ready.')

    print('Initializing nearest neighbor searcher...')
    init_nn()
    print('Nearest neighbor searcher ready.')

    INITIALIZED = True


def init_image_encoder():

    global IMAGE_ENCODER

    IMAGE_ENCODER = hub.KerasLayer("https://tfhub.dev/tensorflow/resnet_50/feature_vector/1",
        trainable=False)


def init_nn():

    from ..models.images.image import Image

    global NN, ALL_IMGS

    all_images = Image.objects.all()
    images_count = all_images.count()
    NN = NearestNeighbors(n_jobs=-1, n_neighbors=min(images_count, MAX_NEIGHBORS))

    if images_count > 0:
        for img_obj in all_images:
            img_bytes = read_image_from_path(img_obj.upload.path)
            img_enc = encode_image(img_bytes)
            ALL_IMGS.append(img_enc)
        NN.fit(ALL_IMGS)


def read_image_from_path(file_path):

    return tf.io.read_file(file_path)


def encode_image(img_bytes):

    img_arr = tf.io.decode_image(img_bytes, channels=3)
    img_arr = tf.image.resize(img_arr, [224, 224])
    img_arr = tf.image.convert_image_dtype(img_arr, dtype=tf.float32)

    img_arr = tf.expand_dims(img_arr, axis=0)

    return IMAGE_ENCODER(img_arr)[0]


def add_image(file_obj):

    global ALL_IMGS, NN

    img_bytes = file_obj.read()

    img_enc = encode_image(img_bytes)
    ALL_IMGS.append(img_enc)

    if len(ALL_IMGS) <= MAX_NEIGHBORS:
        NN = NearestNeighbors(n_jobs=-1, n_neighbors=min(len(ALL_IMGS), MAX_NEIGHBORS))

    NN.fit(ALL_IMGS)


def remove_image(img_obj):

    global ALL_IMGS, NN

    img_idx = img_obj.vector_idx

    ALL_IMGS = ALL_IMGS[:img_idx] + ALL_IMGS[img_idx + 1:]

    if len(ALL_IMGS) <= MAX_NEIGHBORS:
        NN = NearestNeighbors(n_jobs=-1, n_neighbors=min(len(ALL_IMGS), MAX_NEIGHBORS))

    NN.fit(ALL_IMGS)


def search_by_image(file_obj, threshold=0.8):

    img_bytes = file_obj.read()
    img_enc = encode_image(img_bytes)
    img_enc = tf.expand_dims(img_enc, axis=0)

    # distances, preds = NN.kneighbors(img_enc, return_distance=True)

    # distances = distances[0].tolist()
    # preds = preds[0].tolist()

    # results = []

    # for i in range(len(distances)):
    #     if distances[i] <= threshold:
    #         results.append((preds[i], distances[i]))

    # results = sorted(results, key=lambda x: x[1])

    results = []

    for i, img in enumerate(ALL_IMGS):
        similarity = 1 - spatial.distance.cosine(img, img_enc)
        if similarity > threshold:
            results.append((i, similarity))

    results = sorted(results, key=lambda x: x[1], reverse=True)

    return [x[0] for x in results]

    