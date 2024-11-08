// src/components/SelectCity.jsx

import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const malaysianCities = {
  Johor: ["Johor Bahru", "Kluang", "Muar", "Batu Pahat", "Pasir Gudang"],
  Kedah: ["Alor Setar", "Sungai Petani", "Langkawi", "Kulim"],
  Kelantan: ["Kota Bharu", "Gua Musang", "Kuala Krai"],
  Malacca: ["Malacca City", "Ayer Keroh", "Alor Gajah"],
  "Negeri Sembilan": ["Seremban", "Port Dickson", "Nilai", "Jempol"],
  Pahang: ["Kuantan", "Temerloh", "Bentong", "Genting Highlands"],
  Penang: ["George Town", "Butterworth", "Bayan Lepas"],
  Perak: ["Ipoh", "Taiping", "Teluk Intan", "Sungai Siput"],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Keningau"],
  Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu"],
  Selangor: ["Shah Alam", "Petaling Jaya", "Subang Jaya", "Kajang", "Serdang"],
  Terengganu: ["Kuala Terengganu", "Dungun", "Kemaman"],
  "Kuala Lumpur": ["Kuala Lumpur"],
  Labuan: ["Labuan"],
  Putrajaya: ["Putrajaya"]
}

export default function SelectCity({ state, value, onChange }) {
  const cities = state ? malaysianCities[state] : []

  return (
    <Select value={value} onValueChange={onChange} disabled={!state}>
      <SelectTrigger>
        <SelectValue placeholder={state ? "Select City" : "Select State First"} />
      </SelectTrigger>
      <SelectContent>
        {cities.map(city => (
          <SelectItem key={city} value={city}>{city}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
