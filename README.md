# 😴 Drowsiness Detection System

A Python-based deep learning project that classifies eye images as **open or closed** using a Convolutional Neural Network (CNN). The project uses computer vision and image classification techniques to recognize eye states.

## 📌 Overview

The Drowsiness Detection System uses a trained CNN model to distinguish between open-eye and closed-eye images. It applies image preprocessing and deep learning to analyze eye states, demonstrating how computer vision can support automated monitoring applications.

## ✨ Features

- **Eye State Classification:** Classifies eye images as open or closed.
- **CNN-Based Model:** Uses a Convolutional Neural Network for image classification.
- **Image Preprocessing:** Converts images to grayscale and resizes them to 64 × 64 pixels.
- **Computer Vision:** Uses OpenCV for image processing and detection.
- **Deep Learning:** Uses TensorFlow and Keras to build and run the trained model.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Python | Core programming language |
| TensorFlow / Keras | CNN model development and inference |
| OpenCV | Image processing and computer vision |
| NumPy | Numerical operations |
| CNN | Eye-state image classification |

## 📂 Dataset

The project uses an eye-image dataset containing two classes:

- **Open Eyes:** 1,999 images
- **Closed Eyes:** 2,000 images

The images are preprocessed and converted to grayscale before being resized to 64 × 64 pixels for model training.

*Note: The dataset files may need to be downloaded separately if they are not included in the repository.*

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Lakshminarayanan95/Drowsiness-Detection-Project.git
```

### 2. Navigate to the project directory

```bash
cd Drowsiness-Detection-Project
```

### 3. Create a virtual environment (recommended)

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

On macOS or Linux:

```bash
source venv/bin/activate
```

### 4. Install dependencies

Install the required libraries:

```bash
pip install tensorflow opencv-python numpy
```

Use a compatible TensorFlow version if you encounter dependency or Python-version conflicts.

## 🚀 Usage

### Train the model

If the dataset and training script are available in your local repository, run:

```bash
python train_model.py
```

This trains the CNN model using the eye-image dataset. The trained model is saved as `model.h5`, according to the project configuration.

### Run detection

After the model has been trained or the saved model has been provided, run:

```bash
python detect.py
```

The detection script uses the trained model and OpenCV to process eye images or camera input, depending on the implementation.

**Important:** The dataset, trained model, and any required cascade files must be present at the paths expected by the scripts.

## 🧠 How It Works

1. **Image Input:** Loads eye images or obtains image frames through the detection pipeline.
2. **Preprocessing:** Converts images to grayscale and resizes them to 64 × 64 pixels.
3. **Model Inference:** Passes the processed images to the trained CNN.
4. **Classification:** Predicts whether the eyes are open or closed.
5. **Detection Output:** Uses the predicted eye state in the detection workflow.

## 🎯 Applications

- Eye-state monitoring
- Computer vision learning projects
- Deep learning image classification
- Prototyping automated monitoring systems

## 🔮 Future Improvements

- Add temporal analysis to identify prolonged eye closure.
- Integrate an audio alert when a defined drowsiness condition is detected.
- Improve robustness under different lighting conditions.
- Evaluate the model using precision, recall, F1-score, and a confusion matrix.
- Build a simple graphical user interface for easier use.

## ⚠️ Limitations

This project is an educational prototype. Eye-state classification alone does not reliably establish that a person is drowsy. Additional temporal analysis and real-world validation would be required before using such a system in safety-critical environments.

## 👨‍💻 Author

**Lakshmi Narayanan K Y**

- GitHub: [Lakshminarayanan95](https://github.com/Lakshminarayanan95)

## 📄 License

No license is specified here. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
