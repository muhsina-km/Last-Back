const app = require('express').Router();
const petmodel = require("../model/Pet");
const multer = require('multer');

const storage = multer.memoryStorage(); // Store images in memory
const upload = multer({ storage: storage });

// For saving petdetails
app.post('/petnew', upload.single('Image'), async (request, response) => {
  try {
    const {
      Petcode,
      PetName,
      cid,
      Price, // Replace 'Species' with 'Price'
      Age,
      Gender,
      Breed,
      Color,
      Description,
      Status
    } = request.body;

    const newdata = new petmodel({
      Petcode,
      PetName,
      cid,
      Price, // Replace 'Species' with 'Price'
      Age,
      Gender,
      Breed,
      Color,
      Description,
      Status,
      Image: {
        data: request.file.buffer,
        contentType: request.file.mimetype,
      }
    });

    await newdata.save();
    response.status(200).json({ message: 'pet added successfully' });
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/tfetch', async (request, response) => {
  const result = await petmodel.aggregate([
    {
      $lookup: {
        from: 'categories', // Name of the other collection
        localField: 'cid', // field of pet
        foreignField: '_id', // field of category
        as: 'pet',
      },
    },
  ]);

  response.send(result);
});

// For update status of pet - delete
app.put('/updatestatus/:id', async (request, response) => {
  try {
    let id = request.params.id;
    await petmodel.findByIdAndUpdate(id, { $set: { Status: "INACTIVE" } });
    response.send("Record Deleted");
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// For modifying the details pet
app.put('/pedit/:id', async (request, response) => {
  try {
    let id = request.params.id;
    await petmodel.findByIdAndUpdate(id, request.body);
    response.send("Record updated");
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Image edit
app.put('/petedit/:id', upload.single('Image'), async (request, response) => {
  try {
    const id = request.params.id;
    const {
      Petcode,
      PetName,
      cid,
      Breed, // Replace 'Species' with 'Breed'
      Age,
      Gender,
      Price,// Replace 'Breed' with 'Price'
      Color,
      Description,
      Status
    } = request.body;

    let result = null;

    if (request.file) {
      const updatedData = {
        Petcode,
        PetName,
        cid,
        Breed, // Replace 'Species' with 'Breed'
        Age,
        Gender,
        Price,// Replace 'Breed' with 'Price'
        Color,
        Description,
        Status,
        Image: {
          data: request.file.buffer,
          contentType: request.file.mimetype,
        }
      };
      result = await petmodel.findByIdAndUpdate(id, updatedData);
    } else {
      const updatedData = {
        Petcode,
        PetName,
        cid,
        Breed, // Replace 'Species' with 'Breed'
        Age,
        Gender,
        Price, // Replace 'Breed' with 'Price'
        Color,
        Description,
        Status,
      };
      result = await petmodel.findByIdAndUpdate(id, updatedData);
    }

    if (!result) {
      return response.status(404).json({ message: 'Item not found' });
    }

    response.status(200).json({ message: 'Item updated successfully', data: result });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add this to your backend routes
app.get('/tsearch/:searchTerm', async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search

    const searchResults = await petmodel.find({
      $or: [
        { PetName: { $regex: regex } },
        { Breed: { $regex: regex } },
        // Add other fields as needed
      ],
    });

    res.json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = app;

