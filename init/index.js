const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");


main()
.then(() =>{
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
};

const initDB=async() =>{
    await Listing.deleteMany({});
    initData.data= initData.data.map((obj) =>({...obj,owner:"6adef3f653db860e66f126cd",}));
    await Listing.insertMany(initData.data);

    console.log("data was initalized");
};
initDB();
