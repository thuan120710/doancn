import React, { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSongs } from "../../../actions/AuthAdminAction";
import { connect } from "react-redux";
import { fetchCategories } from "../../../actions/CategoryAction";

const Form = (props) => {
  const dispatch = useDispatch();
  const [songData, setSongData] = useState({ artist: "" });
  const [selectedAudioFile, setSelectedAudioFile] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [songName, setSongName] = useState("");
  const [category, setCategory] = useState("");
  const [favourite, setFavourite] = useState("");
  const [type, setType] = useState("");
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const fileInputRefAudio = React.useRef(null); // Ref for Song input
  const fileInputRefImage = React.useRef(null); // Ref for Image input

  useEffect(() => {
    props.fetchCategories();
  }, []);

  const handleAudioFileChange = (event) => {
    setSelectedAudioFile(event.target.files[0]);
  };

  const handleImageFileChange = (event) => {
    setSelectedImageFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("artist", songData.artist);
    formData.append("song", selectedAudioFile);
    formData.append("imgSrc", selectedImageFile);
    formData.append("songName", songName);
    formData.append("category", category);
    formData.append("favourite", favourite);
    formData.append("type", type);

    try {
      await props.createSongs(formData);
      toast.success("Song created successfully!");

      // Reset form fields
      setSongData({ artist: "" });
      setSelectedAudioFile(null);
      setSelectedImageFile(null);
      setSongName("");
      setCategory("");
      setFavourite("");
      setType("");

      // Reset input[type="file"] fields
      if (fileInputRefAudio.current) fileInputRefAudio.current.value = "";
      if (fileInputRefImage.current) fileInputRefImage.current.value = "";
    } catch (error) {
      toast.error("Error creating song. Please try again!");
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE SONG" subtitle="Create a New Song" />
      <Formik
        initialValues={{ songName: "", favourite: false, type: "", artist: "", category: "" }}
        validationSchema={checkoutSchema}
      >
        {({ errors, touched, handleBlur }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Artist"
                onBlur={handleBlur}
                value={songData.artist}
                onChange={(e) => setSongData({ ...songData, artist: e.target.value })}
                name="artist"
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="file"
                inputRef={fileInputRefAudio} // Attach ref to the input
                label="Song"
                onBlur={handleBlur}
                onChange={handleAudioFileChange}
                name="song"
                error={!!touched.song && !!errors.song}
                helperText={touched.song && errors.song}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="file"
                inputRef={fileInputRefImage} // Attach ref to the input
                label="Image Source"
                onBlur={handleBlur}
                onChange={handleImageFileChange}
                name="imgSrc"
                error={!!touched.imgSrc && !!errors.imgSrc}
                helperText={touched.imgSrc && errors.imgSrc}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Song Name"
                onBlur={handleBlur}
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                name="songName"
                error={!!touched.songName && !!errors.songName}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  onBlur={handleBlur}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  name="category"
                  error={!!touched.category && !!errors.category}
                >
                  {props.categories.map((category) => (
                    <MenuItem key={category._id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Favourite"
                onBlur={handleBlur}
                onChange={(e) => setFavourite(e.target.value)}
                value={favourite}
                name="favourite"
                error={!!touched.favourite && !!errors.favourite}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Type"
                onBlur={handleBlur}
                onChange={(e) => setType(e.target.value)}
                value={type}
                name="type"
                error={!!touched.type && !!errors.type}
                helperText={touched.type && errors.type}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Song
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <ToastContainer />
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  songName: yup.string().required("Song name is required"),
  favourite: yup.boolean().required("Favourite status is required"),
});

const mapStateToProps = (state) => ({
  categories: state.CategoryAdmin.categories || [],
});

export default connect(mapStateToProps, { fetchCategories, createSongs })(Form);
