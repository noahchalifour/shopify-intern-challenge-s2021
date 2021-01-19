import tensorflow as tf
import tensorflow_hub as hub
import tensorflow_text as _


def build_encoder():

    text_input = tf.keras.layers.Input(shape=(), dtype=tf.string)

    preprocessor = hub.KerasLayer(
        "https://tfhub.dev/tensorflow/bert_en_uncased_preprocess/3")
    encoder_inputs = preprocessor(text_input)

    encoder = hub.KerasLayer(
        "https://tfhub.dev/tensorflow/bert_en_uncased_L-12_H-768_A-12/3",
        trainable=True)
    outputs = encoder(encoder_inputs)

    pooled_output = outputs["pooled_output"]

    dense_output = tf.keras.layers.Dense(2048)(pooled_output)

    return tf.keras.Model(inputs=[text_input], outputs=[dense_output])