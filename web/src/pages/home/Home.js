import axios from "axios";
import { useEffect, useRef, useState } from "react";
import "./Home.css";

import { baseUrl } from "../../core";

import { GoFileMedia } from "react-icons/go";
import { BsCalendarEvent } from "react-icons/bs";
import { PiArticle } from "react-icons/pi";
import { AiOutlineLike } from "react-icons/ai";
import { BiCommentDetail } from "react-icons/bi";
import { PiShareFat } from "react-icons/pi";
import swal from "sweetalert2";
import moment from "moment";

export default function Home({ profileImg, userName }) {
  const postTextInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editAlert, setEditAlert] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [toggleRefresh, setToggleRefresh] = useState(false);

  const getAllPost = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/feed`, {
        withCredentials: true,
      });
      console.log(response.data);

      setIsLoading(false);
      setAllPosts([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/v1/search?q=${searchInputRef.current.value}`
      );
      console.log(response.data);

      setIsLoading(false);
      setAllPosts([...response.data]);
    } catch (error) {
      // handle error
      console.log(error.data);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllPost();
    setTimeout(() => {
      setAlert("");
    }, 2000);
    // return ()=>{
    //     // cleanup function
    // }
  }, [toggleRefresh, alert]);

  // Sweet Alert function:
  const publishPost = () => {
    swal.fire("Success!", "Your Post have been Publish Thank you!", "success");
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const response = await axios.post(`${baseUrl}/api/v1/post`, {
        // title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
      publishPost();
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
        // title: postTitleInputRef.current.value,
        text: postTextInputRef.current.value,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      setToggleRefresh(!toggleRefresh);
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  const editSaveSubmitHandler = async (e) => {
    e.preventDefault();
    const _id = e.target.elements[0].value;
    // const title = e.target.elements[1].value;
    const text = e.target.elements[1].value;

    try {
      setIsLoading(true);

      const response = await axios.put(`${baseUrl}/api/v1/post/${_id}`, {
        // title: title,
        text: text,
      });

      setIsLoading(false);
      console.log(response.data);
      setAlert(response?.data?.message);
      setToggleRefresh(!toggleRefresh);
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  //   One Click Two function call
  const deleteMainFunction = (_id) => {
    deletePost(_id);
  };

  // Sweet Alert Function:
  const deletePost = (_id) => {
    swal.fire({
      title: "Enter Password",
      input: "password",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      cancelButtonColor: "#3a3659",
      confirmButtonText: "Delete",
      confirmButtonColor: "#3a3659",
      showLoaderOnConfirm: true,
      preConfirm: (password) => {
        if (password === "1122") {
          deletePostHandler(_id);
          swal.fire({
            icon: "success",
            title: "Post Deleted",
            showConfirmButton: true,
          });
        } else {
          return swal.fire({
            icon: "error",
            title: "Invalid Password",
            text: "Please enter correct password",
            showConfirmButton: true,
          });
        }
      },
    });
  };

  const UpdateAlert = () => {
    swal.fire("Success!", "Your Post have been Updated Thank you!", "success");
  };

  const cancelPost = (post) => {
    // console.log("check cancel post");
    swal
      .fire({
        icon: "warning",
        title: "Warning...",
        text: "Are You Sure!",
      })
      .then((result) => {
        if (result.isConfirmed) {
          post.isEdit = false;
          setAllPosts([...allPosts]);
          swal.fire("success!", "Your file has been saved.", "success");
        }
      });
  };

  const doLikeHandler = async (_id) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${baseUrl}/api/v1/post/${_id}/dolike`);

      setIsLoading(false);
      console.log(response.data);
      setAlert(response.data.message);
      // setToggleRefresh(!toggleRefresh);
    } catch (error) {
      // handle error
      console.log(error?.data);
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="search-bar">
        <form onSubmit={searchHandler} style={{ textAlign: "left" }}>
          <input
            type="search"
            className="searching"
            placeholder="Search..."
            ref={searchInputRef}
          />
          <button type="submit" hidden></button>
        </form>
      </div>
      <br />

      <div className="main">
        <form id="formReset" onSubmit={submitHandler} className="form-card">
          <div className="post-create">
            <div className="post-header">
              <img src={profileImg} width={65} height={65} alt="my-image" />
              <div>
                <div className="post-name">{userName}</div>
                <div className="date">
                  {moment().format("D MMM YYYY, h:mm:ss a")}
                </div>
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
                <GoFileMedia style={{ color: "blue", marginRight: "5px" }} />
                Media
              </div>
              <div className="btn">
                <BsCalendarEvent
                  style={{ color: "orange", marginRight: "5px" }}
                />
                Event
              </div>
              <div className="btn">
                <PiArticle style={{ color: "red", marginRight: "5px" }} />
                Write Article
              </div>
            </div>
            <div className="post-btn-main">
              <button className="btn btn-primary post-btn" type="submit">
                Publist Post
              </button>
            </div>
            <span>
              {alert && alert}
              {isLoading && "Loading...."}
            </span>
          </div>
        </form>
      </div>
      <br />

      <div className="all-post">
        {allPosts.map((post, index) => (
          <div className="post" key={post._id}>
            {post.isEdit ? (
              <form onSubmit={editSaveSubmitHandler} className="edit-form-card">
                <div className="edit-card">
                  <div className="edit-post">Edit post</div>
                  <input value={post._id} type="text" disabled hidden />
                  <br />
                  <div className="edit-input">
                    <input
                      defaultValue={post.text}
                      type="text"
                      className="postEditText"
                    />
                    <br />
                  </div>
                  <div className="edit-button">
                    <button
                      type="submit"
                      onClick={UpdateAlert}
                      className="btn btn-outline-light update-btn"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-light cancel-btn"
                      onClick={() => {
                        cancelPost(post);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // edit post form
              <div className="form-card">
                <div className="post-main">
                  <div className="post-header">
                    <img
                      src={profileImg}
                      width={65}
                      height={65}
                      alt="my-image"
                    />

                    <div>
                      <div className="post-name">{post.authorObject.firstName} {post.authorObject.lastName}</div>
                      {/* <div className="date">{post.authorObject.firstName} {post.authorObject.lastName} - {post.authorObject.email}</div> */}
                      <div className="date">{moment().fromNow()}</div>
                      
                    </div>
                  </div>

                  <div className="post-data">
                    <div className="all-post">{post.text}</div>
                  </div>

                  <br />

                  <div className="likeBtn">
                    <AiOutlineLike
                      style={{ color: "#495057", marginRight: "5px" }}
                    />
                    {post?.likes?.length}
                  </div>

                  <hr />

                  <div className="post-footer">
                    <div className="btn">
                      <button style={{border:"none"}}
                        onClick={(e) => {
                          doLikeHandler(post._id);
                        }}
                      >
                        <AiOutlineLike
                          style={{ color: "#495057", marginRight: "5px", }}
                        />
                        Like
                      </button>
                    </div>

                    <div className="btn">
                      <BiCommentDetail
                        style={{ color: "#495057", marginRight: "5px" }}
                      />
                      Comment
                    </div>
                    <div className="btn">
                      <PiShareFat
                        style={{ color: "#495057", marginRight: "5px" }}
                      />
                      Share
                    </div>
                  </div>
                  <br />
                  <div className="buttons">
                    <button
                      class="btn btn-outline-light editBtn"
                      onClick={(e) => {
                        allPosts[index].isEdit = true;
                        setAllPosts([...allPosts]);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      class="btn btn-outline-light deleteBtn"
                      onClick={(e) => {
                        deleteMainFunction(post._id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
