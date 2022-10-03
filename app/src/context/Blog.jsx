import {createContext, useContext, useState, useMemo, useEffect} from "react";
import {useAnchorWallet, useConnection, useWallet} from "@solana/wallet-adapter-react";
import { getAvatarUrl } from "src/functions/getAvatarUrl";
import { getRandomName } from "src/functions/getRandomName";
import idl from "src/idl.json";
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey'
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes'
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

const BlogContext = createContext();
const PROGRAM_KEY = new PublicKey(idl.metadata.address);


export const useBlog = () => {
  if (!context) {
    throw new Error("Parent must be wrapped inside PostsProvider");
  }

  return context;
};

export const BlogProvider = ({ children }) => {
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

    const program = useMemo(() => {
        if(anchorWallet) {
            const provider = new anchor.AnchorProvider(connection, anchorWallet, anchor.AnchorProvider.defaultOptions());
            return new anchor.Program(idl, PROGRAM_KEY, provider);
        }
    }, [connection, anchorWallet]);

    useEffect(() => {
        const start = async () => {
                if (program && publicKey) {
                    try {
                        const [userPda] = findProgramAddressSync([utf8.encode('user'), publicKey.toBuffer()], program.programId);
                        const user = await program.account.userAccount.fetch(userPda);
                        if(user) {
                            setInitialized(true);
                            setUser(user);
                            setLastPostId(user.lastPostId);
                            const postAccounts = await program.account.postAccount.all(publicKey.toString());
                            setPosts(postAccounts);
                        }
                    } catch (error) {
                        console.log(error);
                        setInitialized(false);
                    }
                }
            }
        start();
    }, [program, publicKey, transactionPending]);


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
