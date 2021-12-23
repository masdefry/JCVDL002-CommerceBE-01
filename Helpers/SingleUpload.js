// Import Multer
const multer = require("multer");

const singleUpload = () => {
  // Setting Multer
  // 1. Disk Storage
  let storage = multer.diskStorage({
    destination: function (req, file, next) {
      next(null, "Public/images"); //folder
    },
    filename: function (req, file, next) {
      next(null, "IMG" + "-" + Date.now() + "." + file.mimetype.split("/")[1]);
    },
  });

  // 2. File Filter
  function fileFilter(req, file, next) {
    if (file.mimetype.split("/")[0] === "image") {
      // Accept
      next(null, true);
    } else if (file.mimetype.split("/")[0] !== "image") {
      // Reject
      next(new Error("File Must Be Image"));
    }
  }

  let singleUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 20000000000 },
  }).array("images", 3);

  console.log("The Helper is Running ✔");
  return singleUpload;
};

module.exports = singleUpload;
