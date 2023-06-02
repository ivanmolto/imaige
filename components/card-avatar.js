import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";

const CardAvatar = ({ walletAddress }) => {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    user && (
      <div className="mb-16 overflow-hidden rounded-lg bg-white shadow">
        <h2 className="sr-only" id="profile-overview-title">
          Profile Overview
        </h2>
        <div className="bg-white p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="flex-shrink-0">
                <Image
                  width={20}
                  height={20}
                  className="mx-auto h-20 w-20 rounded-full"
                  src={user.picture}
                  alt=""
                />
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                <p className="text-sm font-medium text-gray-600">Welcome,</p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {user.name}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-200 border-t border-gray-200 bg-gray-50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div key={1} className="px-6 py-5 text-center text-sm font-medium">
            {!walletAddress && (
              <span className="text-gray-600">Loading...</span>
            )}
            {walletAddress && (
              <span className="text-gray-600">
                {walletAddress.slice(0, 8) + "..." + walletAddress.slice(-8)}
              </span>
            )}
          </div>

          <div key={2} className="px-6 py-5 text-center text-sm font-medium">
            <span className="text-gray-600">Gnosis Chain</span>
          </div>

          <div key={3} className="px-6 py-5 text-center text-sm font-medium">
            <span className="text-gray-600">Balance</span>
          </div>
        </div>
      </div>
    )
  );
};

export default CardAvatar;
