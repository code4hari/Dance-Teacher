from flask import Flask, request, jsonify, send_file
import yt_dlp
import logging
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config["MAX_CONTENT_LENGTH"] = 30 * 1024 * 1024

logging.basicConfig(level=logging.INFO)

DOWNLOAD_DIR = "uploads"
UPLOAD_DIR = "uploads"


@app.route("/upload", methods=["POST"])
def upload_video():
    video_file = request.files["video"]
    video_filename = video_file.filename
    video_path = os.path.join(UPLOAD_DIR, video_filename)
    video_file.save(video_path)
    video_url = (
        f"https://b2lffbhv-3000-inspect.use.devtunnels.ms:5000/videos/{video_filename}"
    )
    return jsonify({"video_url": video_url})


@app.route("/videos/<video_filename>", methods=["GET"])
def get_video(video_filename):
    video_path = os.path.join(UPLOAD_DIR, video_filename)
    return send_file(video_path)


@app.route("/uploads/<video_filename>", methods=["GET"])
def get_video_2(video_filename):
    video_path = "uploads/" + video_filename
    return send_file(video_path)


def download_video(url):
    ydl_opts = {
        "verbose": True,
        "restrictfilenames": True,
        "outtmpl": os.path.join(DOWNLOAD_DIR, "%(title)s-%(id)s.%(ext)s"),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            return filename
    except yt_dlp.utils.DownloadError as e:
        logging.error(f"Download error: {e}")
        return None


@app.route("/download", methods=["POST"])
def download_and_host_video():
    url = request.json["url"]
    video_title = download_video(url)
    video_url = f"https://b2lffbhv-3000-inspect.use.devtunnels.ms:5000/{video_title}"
    if video_url:
        return jsonify({"video_url": video_url})
    else:
        return jsonify({"error": "Failed to download video"}), 400


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    os.makedirs(DOWNLOAD_DIR, exist_ok=True)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    app.run(host="0.0.0.0", port=5000, debug=True)
