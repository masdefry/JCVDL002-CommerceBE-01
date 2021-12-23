const multer = require("multer");
const fs = require("fs");

module.exports = {
  uploader: (directory, fileNamePrefix) => {
    // define lokasi penyimpanan gambar / file
    let defaultDir = "./Public";

    // buat fungsi untuk menyimpan file yg diupload k dalam storage public
    //diskStorage : menyimpan file dari frontend ke directory backend
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const pathDir = defaultDir + directory;

        // buat condition untuk pengecekan directory yg dituju (sudah ada atau belum)
        if (fs.existsSync(pathDir)) {
          console.log(`Directory exist`);
          cb(null, pathDir);
        } else {
          fs.mkdir(pathDir, { recursive: true }, (err) => cb(err, pathDir));
        }
      },
      filename: (req, file, cb) => {
        let ext = file.originalname.split(".");
        let filename = fileNamePrefix + "." + ext[ext.length - 1];
        cb(null, filename);
      },
    });

    const fileFilter = (req, file, cb) => {
      const ext = /\.(jpg|jpeg|png|tif|JPG|JPEG|PNG|TIF)/;
      if (!file.originalname.match(ext)) {
        return cb(new Error("Tipe File bukan image"), false);
      }
      cb(null, true);
    };

    return multer({
      storage,
      fileFilter,
    });
  },
};
