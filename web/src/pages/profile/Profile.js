import axios from "axios";
import { useEffect, useRef, useState, useContext } from "react";
import "./Profile.css";
import { baseUrl } from "../../core";
import { GoFileMedia } from 'react-icons/go';
import { BsCalendarEvent } from 'react-icons/bs';
import { PiArticle } from 'react-icons/pi';

import { GlobalContext } from "../../context/Context";
import { useParams } from "react-router-dom";


export default function Profile({profileImg, userName, date}) {
  const { state, dispatch } = useContext(GlobalContext);

  const postTitleInputRef = useRef(null);
  const postTextInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editAlert, setEditAlert] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [toggleRefresh, setToggleRefresh] = useState(false);
  const [profile, setProfile] = useState(false);

  const { userId } = useParams();

  const getAllPost = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/v1/posts?_id=${userId || ""}`,
        {
          withCredentials: true,
        }
      );
      console.log(response.data);

      setIsLoading(false);
      setAllPosts([...response.data]);
    } catch (error) {
      console.log(error.data);
      setIsLoading(false);
    }
    // try {
    //     setIsLoading(true);
    //     const response = await axios.get(`${baseUrl}/api/v1/posts?_id=${userId || ""}` ,{
    //         withCredentials: true
    //     })
    //     console.log(response.data);

    //     setIsLoading(false);
    //     setAllPosts([...response.data]);

    // } catch (error) {
    //     // handle error
    //     console.log(error.data);
    //     setIsLoading(false);
    // }
  };

  const getProfile = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/v1/profile/${userId || ""}`
      );
      console.log(response.data);
      setProfile(response.data);
    } catch (error) {
      // handle error
      console.log(error.data);
    }
  };

  useEffect(() => {
    getAllPost();
    getProfile();
    // return ()=>{
    //     // cleanup function
    // }
  }, [toggleRefresh]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post(`${baseUrl}/api/v1/post`, {
        title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      //   getAllPost();
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
      e.target.reset();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const deletePostHandler = async (_id) => {
    try {
      setIsLoading(true);

      const response = await axios.delete(`${baseUrl}/api/v1/post/${_id}`, {
        title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
      // getAllPost();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const editSaveSubmitHandler = async (e) => {
    e.preventDefault();
    const _id = e.target.elements[0].value;
    const title = e.target.elements[1].value;
    const text = e.target.elements[2].value;

    try {
      setIsLoading(true);

      const response = await axios.put(`${baseUrl}/api/v1/post/${_id}`, {
        title: title,
        text: text,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response?.data?.message);
      setToggleRefresh(!toggleRefresh);
      // getAllPost();
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  return (
    <div className="profile">
      {state.user._id === userId && (
        <form id="formReset" onSubmit={submitHandler} className="form-card">
        <div className="post-main">
          <div className="post-header">
            <img src={profileImg} width={65} height={65} alt="my-image" />
            <div>
              <div className="post-name">{userName}</div>
              <div className="date">{date}</div>
            </div>
          </div>
          <textarea
            id="postTextInput"
            type="text"
            minLength={2}
            maxLength={999}
            ref={postTextInputRef}
            className="post-area"
            placeholder="What's on your mind?"
            required
          ></textarea>
          <br />
          <div className="post-footer">
            <div className="btn">
              <GoFileMedia style={{color: "blue", marginRight: "5px"}}/>
              Media
            </div>
            <div className="btn">
              <BsCalendarEvent style={{color: "orange", marginRight: "5px"}}/> 
              Event
            </div>
            <div className="btn">
              <PiArticle style={{color: "red", marginRight: "5px"}}/> 
              Write Article
            </div>
          </div>
          <div className="post-btn-main">
              <button className="btn btn-primary post-btn" type="submit">Publist Post</button>
          </div>
          <span>
            {alert && alert}
            {isLoading && "Loading...."}
          </span>
        </div>
      </form>
        // <form id="formReset" onSubmit={submitHandler}>
        //   <label htmlFor="postTitleInput"> Post Title: </label>
        //   <input
        //     id="postTitleInput"
        //     type="text"
        //     minLength={2}
        //     maxLength={20}
        //     ref={postTitleInputRef}
        //     required
        //   />
        //   <br />
        //   <br />

        //   <label htmlFor="postBodyInput"> Post Body: </label>
        //   <textarea
        //     id="postBodyInput"
        //     type="text"
        //     minLength={2}
        //     maxLength={999}
        //     ref={postTextInputRef}
        //     required
        //   ></textarea>
        //   <br />
        //   <br />
        //   <button type="submit">Publist Post</button>
        //   <span>
        //     {alert && alert}
        //     {isLoading && "Loading...."}
        //   </span>
        // </form>
      )}
      <hr />

      <div className="all-post">
        <div className="banner">
          <img className="bannerImg" src="./" alt="" />
          <img className="bannerImg" src="./" alt="" />
          <div className="profileName">
            <h1>
              {profile?.data?.firstName} {profile?.data?.lastName}
            </h1>
          </div>
        </div>

        {allPosts.map((post, index) => (
          <div className="post" key={post._id}>
            {post.isEdit ? (
              <form onSubmit={editSaveSubmitHandler}>
                <input value={post._id} type="text" disabled hidden />
                <br />
                <input
                  defaultValue={post.title}
                  type="text"
                  placeholder="title"
                />
                <br />
                <textarea
                  defaultValue={post.text}
                  type="text"
                  placeholder="body"
                />
                <br />
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    post.isEdit = false;
                    setAllPosts([...allPosts]);
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              // edit post form
              <div>
                <h2>{post.title}</h2>
                <p>{post.text}</p>
                <br />
                <button
                  onClick={(e) => {
                    allPosts[index].isEdit = true;
                    setAllPosts([...allPosts]);
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    deletePostHandler(post._id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {allPosts.length === 0 && <div>No Data</div>}
      </div>
    </div>
  );
}
