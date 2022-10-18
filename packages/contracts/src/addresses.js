/**
 * See all ids below
 * https://ethereum.stackexchange.com/questions/17051/how-to-select-a-network-id-or-is-there-a-list-of-network-ids
 */
export const FANTOM_MAIN_ID = 250;
export const FANTOM_TEST_ID = 4002;

export default {
  [FANTOM_MAIN_ID]: {
    tokens: {
      SFTM: "0x69c744d3444202d35a2783929a0f930f2fbb05ad",
    },
    sfc: "0xfc00face00000000000000000000000000000000",
    stakeTokenizer: "0xC3e8459464A0e8fd08d767a16b5C211b45AC961F",
    gov: "0x7c3b85a71e4fce1209a81d67f1af46b5a068770e",
    govProposal: "0x7403b7d2d0645f576ef5f702736390ad9fb6f6b0",
    govProposalPlaintext: "0xc9f5aa2c93ae9e89a77dc60e7e3cfff1234e4287",
    openOceanExchange: "0x6352a56caadC4F1E25CD6c75970Fa768A3304e64",
  },
  [FANTOM_TEST_ID]: {
    tokens: {
      SFTM: "0x3b28f151899bd945ac1559a3540b5741c7d2bd55",
    },
    // sfc: "0xA87c1a650D8aCEfcf017b3Ef480ece942E1BF02b",
    sfc: "0xfc00face00000000000000000000000000000000",
    stakeTokenizer: "0xea285cffa1defe82d34639d275d444785e05a128",
    // gov: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
    // govNetwork: "0xdCFFfcB46Bb241DE8EED0a70329348000f5f03c7",
    // govProposal: "0xf843e0625e4975e7e654b2f1b374818ba2b4ffbf",
    // govProposalPlaintext: "0xb4673f085ae472c2974febfed3a41bb73aeb172e",
    // govProposalNetwork: "0x96682BFeF7a2dbcF6724A5312369be626154F22A",
    // govProposalTemplate: "0xb09012a5C48840d9BCb94ab127263eB603325D50",
    // sfc: "0x6C16C9276bf0DBE9f69FAaD79a6A6dd4184C57c4",
    // sfc: "0x62d5Eb7AFe345881970D269447e59e48BaB2b79C",
    // gov: "0xF4f2e264C2Ca42a1F876881d09C4ba20e9B1b1bc",
    // gov: "0x5f8eE92ff0a0dF7849Cdb415b926ea63BD84Ef51",
    gov: "0xaa3a160e91f63f1db959640e0a7b8911b6bd5b95",
    // govProposalFactory: "0x9B4872545F38c5E8892e3ef740DE6F37a4b02809",
    // govProposalFactory: "0xc82bebCec223Bc50F0e0BbB35f2F6cc6c2b42bC1",
    govProposalFactory: "0x6B3546FFAe19647914616CE8Eacc180cE90f65a6",
    // govProposalTemplate: "0x1046F851C7750e61F54F683d2189984e7A9032e6",
    // govProposalTemplate: "0xD14b356934397049128aa6C8650af6d89A076E0a",
    govProposalTemplates: "0xf843e0625e4975e7e654b2f1b374818ba2b4ffbf",
  },
};
