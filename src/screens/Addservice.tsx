// import React, { useState } from "react";

// import { serviceApi } from "../service/serviceapi";

// import { useNavigate } from "react-router-dom";

// import {
//   FaLayerGroup,
//   FaTag,
//   FaRupeeSign,
//   FaClock,
//   FaFileAlt,
//   FaFire,
//   FaIcons,
//   FaCheckCircle,
//   FaPlus,
// } from "react-icons/fa";

// const AddService: React.FC = () => {

//   const navigate = useNavigate();

//   const [name, setName] = useState("");

//   const [category, setCategory] =
//     useState("");

//   const [price, setPrice] = useState("");

//   const [description, setDescription] =
//     useState("");

//   const [duration, setDuration] =
//     useState("");

//   const [tags, setTags] = useState("");

//   const [icon, setIcon] = useState("");

//   const [isActive, setIsActive] =
//     useState("true");

//   const [popularity, setPopularity] =
//     useState("");

//   // ==============================
//   // ADD SERVICE
//   // ==============================

//   const handleAddService = async () => {

//     try {

//       if (
//         !name ||
//         !category ||
//         !price ||
//         !duration
//       ) {

//         alert(
//           "Please fill required fields"
//         );

//         return;
//       }

//       const payload = {

//         name,

//         category,

//         basePrice: Number(price),

//         description,

//         duration: {
//           value: Number(duration),
//           unit: "minutes",
//         },

//         tags: tags
//           ? tags.split(",")
//           : [],

//         icon,

//         isActive:
//           isActive === "true",

//         popularity: popularity
//           ? Number(popularity)
//           : 0,
//       };

//       console.log(
//         "PAYLOAD 👉",
//         payload
//       );

//       const res =
//         await serviceApi.createService(
//           payload
//         );

//       console.log(
//         "RESPONSE 👉",
//         res
//       );

//       alert(
//         "Service Added Successfully"
//       );

//       navigate(-1);

//     } catch (error: any) {

//       console.log(
//         "ERROR 👉",
//         error?.response?.data || error
//       );

//       alert(
//         "Error: " +
//           (error?.response?.data
//             ?.message ||
//             "Something went wrong")
//       );
//     }
//   };

//   // ==============================
//   // INPUT STYLE
//   // ==============================

//   const inputStyle = {
//     width: "100%",

//     height: "55px",

//     border: "none",

//     borderRadius: "16px",

//     background: "#f7f9fc",

//     padding: "0 18px 0 50px",

//     outline: "none",

//     boxShadow:
//       "0 4px 12px rgba(0,0,0,0.05)",

//     fontSize: "15px",
//   };

//   // ==============================
//   // UI
//   // ==============================

//   return (

//     <div
//       style={{
//         marginLeft: "260px",

//         marginTop: "70px",

//         minHeight: "100vh",

//         background: "#f5f7fb",

//         padding: "35px",
//       }}
//     >

//       {/* MAIN CARD */}

//       <div
//         style={{
//           maxWidth: "1100px",

//           margin: "0 auto",

//           background: "#fff",

//           borderRadius: "30px",

//           padding: "35px",

//           boxShadow:
//             "0 8px 30px rgba(0,0,0,0.08)",

//           position: "relative",

//           overflow: "hidden",
//         }}
//       >

//         {/* TOP GRADIENT */}

//         <div
//           style={{
//             position: "absolute",

//             top: 0,
//             left: 0,
//             right: 0,

//             height: "8px",

//             background:
//               "linear-gradient(to right, #FFFF6D, #8FDAFA)",
//           }}
//         />

//         {/* HEADER */}

//         <div
//           className="text-center mb-5"
//         >

//           <div
//             style={{
//               width: 90,
//               height: 90,

//               margin: "0 auto 18px",

//               borderRadius: "50%",

//               background:
//                 "linear-gradient(to right, #FFFF6D, #8FDAFA)",

//               display: "flex",

//               alignItems: "center",

//               justifyContent: "center",

//               boxShadow:
//                 "0 8px 20px rgba(0,0,0,0.08)",
//             }}
//           >

//             <FaPlus
//               size={34}
//               color="#14344A"
//             />

//           </div>

//           <h2
//             style={{
//               color: "#14344A",

//               fontWeight: 700,

//               marginBottom: 10,
//             }}
//           >
//             Add New Service
//           </h2>

//           <p
//             style={{
//               color: "#777",
//             }}
//           >
//             Create and manage your service
//             details
//           </p>

//         </div>

//         {/* FORM GRID */}

//         <div
//           style={{
//             display: "grid",

//             gridTemplateColumns:
//               "1fr 1fr",

//             gap: 25,
//           }}
//         >

//           {/* SERVICE NAME */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaLayerGroup
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               style={inputStyle}

//               placeholder="Service Name"

//               value={name}

//               onChange={(e) =>
//                 setName(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* CATEGORY */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaTag
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               style={inputStyle}

//               placeholder="Category"

//               value={category}

//               onChange={(e) =>
//                 setCategory(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* PRICE */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaRupeeSign
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               type="number"

//               style={inputStyle}

//               placeholder="Price"

//               value={price}

//               onChange={(e) =>
//                 setPrice(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* DURATION */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaClock
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               type="number"

//               style={inputStyle}

//               placeholder="Duration (mins)"

//               value={duration}

//               onChange={(e) =>
//                 setDuration(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* DESCRIPTION */}

//           <div
//             style={{
//               position: "relative",

//               gridColumn:
//                 "1 / span 2",
//             }}
//           >

//             <FaFileAlt
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <textarea
//               placeholder="Description"

//               value={description}

//               onChange={(e) =>
//                 setDescription(
//                   e.target.value
//                 )
//               }

//               style={{
//                 width: "100%",

//                 minHeight: "130px",

//                 border: "none",

//                 borderRadius: "16px",

//                 background:
//                   "#f7f9fc",

//                 padding:
//                   "18px 18px 18px 50px",

//                 outline: "none",

//                 boxShadow:
//                   "0 4px 12px rgba(0,0,0,0.05)",

//                 resize: "none",
//               }}
//             />

//           </div>

//           {/* ICON */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaIcons
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               style={inputStyle}

//               placeholder="Icon"

//               value={icon}

//               onChange={(e) =>
//                 setIcon(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* STATUS */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaCheckCircle
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <select
//               value={isActive}

//               onChange={(e) =>
//                 setIsActive(
//                   e.target.value
//                 )
//               }

//               style={{
//                 ...inputStyle,

//                 appearance: "none",

//                 cursor: "pointer",
//               }}
//             >

//               <option value="true">
//                 Active
//               </option>

//               <option value="false">
//                 Inactive
//               </option>

//             </select>

//           </div>

//           {/* POPULARITY */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaFire
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               type="number"

//               style={inputStyle}

//               placeholder="Popularity"

//               value={popularity}

//               onChange={(e) =>
//                 setPopularity(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//           {/* TAGS */}

//           <div
//             style={{
//               position: "relative",
//             }}
//           >

//             <FaTag
//               style={{
//                 position: "absolute",

//                 top: "20px",

//                 left: "18px",

//                 color: "#14344A",
//               }}
//             />

//             <input
//               style={inputStyle}

//               placeholder="Tags (comma separated)"

//               value={tags}

//               onChange={(e) =>
//                 setTags(
//                   e.target.value
//                 )
//               }
//             />

//           </div>

//         </div>

//         {/* BUTTON */}

//         <button
//           onClick={handleAddService}

//           style={{
//             width: "100%",

//             height: "58px",

//             border: "none",

//             borderRadius: "18px",

//             marginTop: "35px",

//             background:
//               "linear-gradient(to right, #FFFF6D, #8FDAFA)",

//             color: "#14344A",

//             fontWeight: 700,

//             fontSize: "16px",

//             boxShadow:
//               "0 8px 20px rgba(0,0,0,0.08)",

//             transition: "0.3s",
//           }}
//         >
//           Add Service
//         </button>

//       </div>

//     </div>
//   );
// };

// export default AddService;

import React, { useEffect, useState } from "react";

import { serviceApi } from "../service/serviceapi";

import { useNavigate } from "react-router-dom";

import {
  FaLayerGroup,
  FaTag,
  FaRupeeSign,
  FaClock,
  FaFileAlt,
  FaFire,
  FaIcons,
  FaCheckCircle,
  FaPlus,
} from "react-icons/fa";

const AddService: React.FC = () => {

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [category, setCategory] =
    useState("");

  const [categories, setCategories] =
    useState<any[]>([]);

  const [price, setPrice] = useState("");

  const [description, setDescription] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [tags, setTags] = useState("");

  const [icon, setIcon] = useState("");

  const [isActive, setIsActive] =
    useState("true");

  const [popularity, setPopularity] =
    useState("");

  // ==============================
  // GET CATEGORIES
  // ==============================
// ==============================
// GET CATEGORIES
// ==============================

useEffect(() => {
  fetchCategories();
}, []);

const fetchCategories = async () => {

  try {

    const res: any =
      await serviceApi.getCategories();

    console.log(
      "CATEGORY RESPONSE 👉",
      res
    );

    // ✅ FIXED
   setCategories(
  res?.categories || []
);

  } catch (error) {

    console.log(
      "CATEGORY ERROR 👉",
      error
    );
  }
};

  // ==============================
  // ADD SERVICE
  // ==============================

  const handleAddService = async () => {

    try {

      if (
        !name ||
        !category ||
        !price ||
        !duration
      ) {

        alert(
          "Please fill required fields"
        );

        return;
      }

      const payload = {

        name,

        category,

        basePrice: Number(price),

        description,

        duration: {
          value: Number(duration),
          unit: "minutes",
        },

        tags: tags
          ? tags.split(",")
          : [],

        icon,

        isActive:
          isActive === "true",

        popularity: popularity
          ? Number(popularity)
          : 0,
      };

      console.log(
        "PAYLOAD 👉",
        payload
      );

      const res =
        await serviceApi.createService(
          payload
        );

      console.log(
        "RESPONSE 👉",
        res
      );

      alert(
        "Service Added Successfully"
      );

      navigate(-1);

    } catch (error: any) {

      console.log(
        "ERROR 👉",
        error?.response?.data || error
      );

      alert(
        "Error: " +
          (error?.response?.data
            ?.message ||
            "Something went wrong")
      );
    }
  };

  // ==============================
  // INPUT STYLE
  // ==============================

  const inputStyle = {
    width: "100%",

    height: "55px",

    border: "none",

    borderRadius: "16px",

    background: "#f7f9fc",

    padding: "0 18px 0 50px",

    outline: "none",

    boxShadow:
      "0 4px 12px rgba(0,0,0,0.05)",

    fontSize: "15px",
  };

  // ==============================
  // UI
  // ==============================

  return (

    <div
      style={{
        marginLeft: "260px",

        marginTop: "70px",

        minHeight: "100vh",

        background: "#f5f7fb",

        padding: "35px",
      }}
    >

      {/* MAIN CARD */}

      <div
        style={{
          maxWidth: "1100px",

          margin: "0 auto",

          background: "#fff",

          borderRadius: "30px",

          padding: "35px",

          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",

          position: "relative",

          overflow: "hidden",
        }}
      >

        {/* TOP GRADIENT */}

        <div
          style={{
            position: "absolute",

            top: 0,
            left: 0,
            right: 0,

            height: "8px",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",
          }}
        />

        {/* HEADER */}

        <div
          className="text-center mb-5"
        >

          <div
            style={{
              width: 90,
              height: 90,

              margin: "0 auto 18px",

              borderRadius: "50%",

              background:
                "linear-gradient(to right, #FFFF6D, #8FDAFA)",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              boxShadow:
                "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >

            <FaPlus
              size={34}
              color="#14344A"
            />

          </div>

          <h2
            style={{
              color: "#14344A",

              fontWeight: 700,

              marginBottom: 10,
            }}
          >
            Add New Service
          </h2>

          <p
            style={{
              color: "#777",
            }}
          >
            Create and manage your service
            details
          </p>

        </div>

        {/* FORM GRID */}

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "1fr 1fr",

            gap: 25,
          }}
        >

          {/* SERVICE NAME */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaLayerGroup
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              placeholder="Service Name"

              value={name}

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

          </div>
{/* CATEGORY SELECT */}

<div
  style={{
    position: "relative",
  }}
>

  <FaTag
    style={{
      position: "absolute",

      top: "20px",

      left: "18px",

      color: "#14344A",

      zIndex: 1,
    }}
  />

  <select
    value={category}

    onChange={(e) =>
      setCategory(
        e.target.value
      )
    }

    style={{
      ...inputStyle,

      appearance: "none",

      cursor: "pointer",
    }}
  >

    <option value="">
      Select Category
    </option>

    {categories?.map(
      (
        cat: any,
        index: number
      ) => (

        <option
          key={index}
          value={cat?.name}
        >
          {cat?.name}
        </option>
      )
    )}

  </select>

</div>

          {/* PRICE */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaRupeeSign
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              type="number"

              style={inputStyle}

              placeholder="Price"

              value={price}

              onChange={(e) =>
                setPrice(
                  e.target.value
                )
              }
            />

          </div>

          {/* DURATION */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaClock
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              type="number"

              style={inputStyle}

              placeholder="Duration (mins)"

              value={duration}

              onChange={(e) =>
                setDuration(
                  e.target.value
                )
              }
            />

          </div>

          {/* DESCRIPTION */}

          <div
            style={{
              position: "relative",

              gridColumn:
                "1 / span 2",
            }}
          >

            <FaFileAlt
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <textarea
              placeholder="Description"

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              style={{
                width: "100%",

                minHeight: "130px",

                border: "none",

                borderRadius: "16px",

                background:
                  "#f7f9fc",

                padding:
                  "18px 18px 18px 50px",

                outline: "none",

                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.05)",

                resize: "none",
              }}
            />

          </div>

          {/* ICON */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaIcons
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              placeholder="Icon"

              value={icon}

              onChange={(e) =>
                setIcon(
                  e.target.value
                )
              }
            />

          </div>

          {/* STATUS */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaCheckCircle
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <select
              value={isActive}

              onChange={(e) =>
                setIsActive(
                  e.target.value
                )
              }

              style={{
                ...inputStyle,

                appearance: "none",

                cursor: "pointer",
              }}
            >

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>

            </select>

          </div>

          {/* POPULARITY */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaFire
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              type="number"

              style={inputStyle}

              placeholder="Popularity"

              value={popularity}

              onChange={(e) =>
                setPopularity(
                  e.target.value
                )
              }
            />

          </div>

          {/* TAGS */}

          <div
            style={{
              position: "relative",
            }}
          >

            <FaTag
              style={{
                position: "absolute",

                top: "20px",

                left: "18px",

                color: "#14344A",
              }}
            />

            <input
              style={inputStyle}

              placeholder="Tags (comma separated)"

              value={tags}

              onChange={(e) =>
                setTags(
                  e.target.value
                )
              }
            />

          </div>

        </div>

        {/* BUTTON */}

        <button
          onClick={handleAddService}

          style={{
            width: "100%",

            height: "58px",

            border: "none",

            borderRadius: "18px",

            marginTop: "35px",

            background:
              "linear-gradient(to right, #FFFF6D, #8FDAFA)",

            color: "#14344A",

            fontWeight: 700,

            fontSize: "16px",

            boxShadow:
              "0 8px 20px rgba(0,0,0,0.08)",

            transition: "0.3s",
          }}
        >
          Add Service
        </button>

      </div>

    </div>
  );
};

export default AddService;