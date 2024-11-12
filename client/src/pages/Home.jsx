import axios from "axios"
import Footer from "../components/Footer"
import HomePosts from "../components/HomePosts"
import Navbar from "../components/Navbar"
import { useContext, useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import Loader from '../components/Loader'
import { UserContext } from "../context/UserContext"

const Home = () => {
  const { search } = useLocation()
  const [posts, setPosts] = useState([])
  const [noResults, setNoResults] = useState(false)
  const [loader, setLoader] = useState(false)
  const { user } = useContext(UserContext)

  const fetchPosts = async () => {
    setLoader(true)
    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/api/posts/${search}`)
      setPosts(res.data)
      setNoResults(res.data.length === 0)
      setLoader(false)
    } catch (err) {
      console.log(err)
      setLoader(true)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [search])

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-24 min-h-[80vh] py-8 bg-gradient-to-b from-gray-50 to-gray-100">
        {loader ? (
          <div className="h-[40vh] flex justify-center items-center">
            <Loader />
          </div>
        ) : !noResults ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post._id} 
                to={user ? `/posts/post/${post._id}` : "/login"} 
                className="block transform transition duration-300 hover:scale-105"
              >
                <HomePosts 
                  post={post} 
                  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg"
                />
              </Link>
            ))}
          </div>
        ) : (
          <h3 className="text-center font-bold mt-16 text-2xl text-gray-600">
            No posts available
          </h3>
        )}
      </div>
      <Footer />
    </>
  )
}

export default Home
