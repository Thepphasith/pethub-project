// VientianeCityDistrict.ts
export enum VientianeCityDistrict {
  CHANTHABULY = "CHANTHABULY",
  SIKHOTTABONG = "SIKHOTTABONG",
  XAYSETHA = "XAYSETHA",
  SISATTANAK = "SISATTANAK",
  NAXAITHONG = "NAXAITHONG",
  XAYTHANY = "XAYTHANY",
  HADXAYFONG = "HADXAYFONG",
  SANGTHONG = "SANGTHONG",
  MAYPARKNGUM = "MAYPARKNGUM",
  PAKNGUM = "PAKNGUM",
}

// Helper object with additional information
export const VientianeCityInfo = {
  [VientianeCityDistrict.CHANTHABULY]: {
    laoName: "ຈັນທະບູລີ",
    code: "VTE-01",
  },
  [VientianeCityDistrict.SIKHOTTABONG]: {
    laoName: "ສີໂຄດຕະບອງ",
    code: "VTE-02",
  },
  [VientianeCityDistrict.XAYSETHA]: {
    laoName: "ໄຊເສດຖາ",
    code: "VTE-03",
  },
  [VientianeCityDistrict.SISATTANAK]: {
    laoName: "ສີສັດຕະນາກ",
    code: "VTE-04",
  },
  [VientianeCityDistrict.NAXAITHONG]: {
    laoName: "ນາຊາຍທອງ",
    code: "VTE-05",
  },
  [VientianeCityDistrict.XAYTHANY]: {
    laoName: "ໄຊທານີ",
    code: "VTE-06",
  },
  [VientianeCityDistrict.HADXAYFONG]: {
    laoName: "ຫາດຊາຍຟອງ",
    code: "VTE-07",
  },
  [VientianeCityDistrict.SANGTHONG]: {
    laoName: "ສັງທອງ",
    code: "VTE-08",
  },
  [VientianeCityDistrict.MAYPARKNGUM]: {
    laoName: "ໄມປາກງື່ມ",
    code: "VTE-09",
  },
  [VientianeCityDistrict.PAKNGUM]: {
    laoName: "ປາກງື່ມ",
    code: "VTE-10",
  },
};

// Convert enum to array for Autocomplete component
export const VientianeCityOptions = Object.values(VientianeCityDistrict);
