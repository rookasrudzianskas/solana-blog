import {createContext, useContext, useState} from "react";
import {useAnchorWallet, useConnection, useWallet} from "@solana/wallet-adapter-react";

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  const [user, setUser] = useState();
  const [initialized, setInitialized] = useState(false);
  const [posts, setPosts] = useState([]);
  const [transactionPending, setTransactionPending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastPostId, setLastPostId] = useState();

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }

  return context;
};

export const BlogProvider = ({ children }) => {


  return (
    <BlogContext.Provider
        value={{
          user,
          posts,
          initialized,
          initUser,
          createPost,
          showModal,
          setShowModal,
        }}
    >
      {children}
    </BlogContext.Provider>
  );
};
