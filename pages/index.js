import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import CardAvatar from "../components/card-avatar";
import * as ethers from "ethers";
import {
  useEtherspotAddresses,
  useEtherspotBalances,
} from "@etherspot/transaction-kit";

import Loading from "../components/loading";
import Head from "next/head";
import Image from "next/image";

import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const { user, error, isLoading } = useUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [errorAi, setErrorAi] = useState(null);

  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [minting, setMinting] = useState(false);
  const [readyToMint, setReadyToMint] = useState(false);

  const [mynfts, setMynfts] = useState([]);
  const [myNftsLoading, setMynftsLoading] = useState(true);

  const [loginLoading, setLoginLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState();

  const [gnosisSmartWalletAddress, setGnosisSmartWalletAddress] =
    useState(false);
  const etherspotAddresses = useEtherspotAddresses();

  useEffect(() => {
    const fetchGnosisSmartWallet = () => {
      if (etherspotAddresses.length && !gnosisSmartWalletAddress) {
        const gnosisNetwork = etherspotAddresses.find(
          (network) => network.chainName === "xdai"
        );
        setGnosisSmartWalletAddress(gnosisNetwork.address);
      }
    };

    fetchGnosisSmartWallet();
  }, [etherspotAddresses, gnosisSmartWalletAddress]);

  const etherspotBalanceOnGnosis = useEtherspotBalances(100);
  console.log(etherspotBalanceOnGnosis);

  const handlePromptChange = (e) => {
    let promptValue = e.target.value;
    setPrompt(promptValue);
  };

  const checkStatus = async (clear, id) => {
    const response = await fetch("/api/predictions/" + id);
    let prediction = await response.json();
    if (response.status !== 200) {
      setErrorAi(prediction.detail);
      return;
    }
    setPrediction(prediction);
    if (prediction.status == "succeeded") {
      setImageUrl(prediction.output[prediction.output.length - 1]);
      clearInterval(clear);
      setPrompt("");
      setGeneratingImage(false);
      setReadyToMint(true);
    }
  };

  const generateImage = async () => {
    setReadyToMint(false);
    setImageUrl("");
    setGeneratingImage(true);
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${prompt}`,
        image_dimensions: "512x512",
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setErrorAi(prediction.detail);
      return;
    }
    setPrediction(prediction);

    let clear = setInterval(() => {
      checkStatus(clear, prediction.id);
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await generateImage();
  };

  const generateIpfsHash = async () => {
    try {
      const now = new Date();
      let timestamp = date.format(now, "YYYY/MM/DD HH:mm:ss");
      var data = JSON.stringify({
        pinataContent: {
          url: imageUrl,
          owner: walletAddress,
          timestamp: timestamp,
        },
      });
      var config = {
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinata_jwt}`,
        },
        data: data,
      };

      const res = await axios(config);
      return res.data.IpfsHash;
    } catch (err) {
      console.log(err);
    }
  };

  const mintNFT = async () => {
    setMinting(true);
    let ipfsHash = await generateIpfsHash();
    let iface = new ethers.utils.Interface(CONTRACT_ABI);
    let tokenURI = `https://ipfs.io/ipfs/${ipfsHash}`;
    let recipient = walletAddress;
    let tx = iface.encodeFunctionData("mintNFT", [recipient, tokenURI]);
    setMinting(false);
  };

  return (
    <>
      <Head>
        <title>Imaige | Convert your AI dreams into NFTs</title>
      </Head>
      <div className="bg-white">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Imaige</span>
                <Image
                  src="/imaige.svg"
                  alt="Imaige Logo"
                  width={36}
                  height={36}
                  priority
                />
              </a>
            </div>
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              {user && (
                <a
                  href="/api/auth/logout"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Log out <span aria-hidden="true">&rarr;</span>
                </a>
              )}
            </div>
          </nav>
          <Dialog
            as="div"
            className="lg:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
          >
            <div className="fixed inset-0 z-50" />
            <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <a href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Imaige</span>
                  <Image
                    src="/imaige.svg"
                    alt="Imaige Logo"
                    width={36}
                    height={36}
                    priority
                  />
                </a>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="py-6">
                    {!user && (
                      <a
                        href="/api/auth/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        Log in
                      </a>
                    )}
                    {user && (
                      <a
                        href="/api/auth/logout"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        Log out
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        </header>

        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          {!user && !isLoading && (
            <div className="mt-32 mx-auto max-w-2xl py-8 sm:py-12 lg:py-14">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-4">
                  Dream something
                  <br /> Mint it as an NFT
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  No need to create or connect a wallet. We handle it for you!
                  <br />
                  Log in directly through your Socials.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="/api/auth/login"
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Get started
                  </a>
                </div>
              </div>
            </div>
          )}
          {isLoading && (
            <div className="mt-32 mx-auto max-w-2xl py-8 sm:py-12 lg:py-14">
              <Loading />
            </div>
          )}
          {!isLoading && user && (
            <div className="mt-2 mx-auto max-w-2xl py-8 sm:py-12 lg:py-14">
              <div className="text-center">
                <CardAvatar walletAddress={gnosisSmartWalletAddress} />
                <div
                  htmlFor="prompt"
                  className="block text-sm font-medium leading-6 text-gray-900 hover:underline"
                >
                  <a
                    href="https://replicate.com/stability-ai/stable-diffusion"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Prompt to Stability AI - Stable Diffusion
                  </a>
                </div>
                <form className="mt-2" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="prompt"
                    value={prompt}
                    onChange={handlePromptChange}
                    id="prompt"
                    className="block w-full rounded-md border-0 p-4 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter a prompt to display an image"
                  />

                  <div className="mt-4 flex items-center justify-center gap-x-6">
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      I&#39;m Feeling Lucky
                    </button>
                    <button
                      onClick={mintNFT}
                      disabled={generatingImage && !readyToMint && !imageUrl}
                      className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      Mint NFT
                    </button>
                  </div>
                </form>
                {errorAi && <div>{errorAi}</div>}
                {prediction && (
                  <div className="mt-4">
                    <p className="text-sm italic">
                      Status: AI generated image {prediction.status}
                    </p>

                    {imageUrl && prediction.output && (
                      <div className="w-full aspect-square relative">
                        <Image fill src={imageUrl} alt="output" sizes="100vw" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          <div
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
