import useRestApi from "./useRestApi";
import { useEffect, useState } from "react";

export const UNSTOPPABLE_DOMAIN_BASEURL =
  "https://resolve.unstoppabledomains.com";

export enum UNSTOPPABLE_DOMAINS_METHODS {
  GET_DOMAIN_RECORDS = "/domains",
  GET_SUPPORTED_TLDS = "/supported_tlds",
}
const token = process.env.REACT_APP_UD_TOKEN;

const useUnstoppableDomains = () => {
  const { get } = useRestApi(UNSTOPPABLE_DOMAIN_BASEURL);
  const [tlds, setTlds] = useState([
    "crypto",
    "coin",
    "wallet",
    "blockchain",
    "bitcoin",
    "x",
    "888",
    "nft",
    "dao",
    "zil",
  ]);

  const getDomainRecords = (domain: string) => {
    return get({
      path: `${UNSTOPPABLE_DOMAINS_METHODS.GET_DOMAIN_RECORDS}/${domain}`,
      config: { headers: { Authorization: `Bearer ${token}` } },
    });
  };

  const getOwnerDomains = (address: string) => {
    return get({
      path: `${UNSTOPPABLE_DOMAINS_METHODS.GET_DOMAIN_RECORDS}?resolution={"crypto.FTM.version.OPERA.address":"${address}"}`,
      config: { headers: { Authorization: `Bearer ${token}` } },
    });
  };

  const getSupportedTlds = () => {
    return get({
      path: UNSTOPPABLE_DOMAINS_METHODS.GET_SUPPORTED_TLDS,
    });
  };

  const getFantomAddressForDomain = async (domain: string) => {
    const response = await getDomainRecords(domain);
    if (response?.data?.records["crypto.FTM.version.OPERA.address"]) {
      return response?.data?.records["crypto.FTM.version.OPERA.address"];
    }
    return "";
  };

  const getFantomDomainForAddress = async (address: string) => {
    const response = await getOwnerDomains(address);
    if (response?.data?.data?.length) {
      return response.data.data.map((record: any) => record.id);
    }
    return [];
  };

  const isValidDomain = (domain: string) => {
    const splitDomain = domain.split(".");
    if (splitDomain.length === 2) {
      if (tlds.includes(splitDomain[1].toLowerCase())) {
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    getSupportedTlds().then((response) => {
      if (response?.data?.tlds) {
        setTlds(response?.data?.tlds);
      }
    });
  }, []);

  return {
    getFantomAddressForDomain,
    getFantomDomainForAddress,
    getDomainRecords,
    getOwnerDomains,
    getSupportedTlds,
    isValidDomain,
  };
};

export default useUnstoppableDomains;
