// src/components/SelectState.jsx

import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

const malaysianStates = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Malacca",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya"
]

export default function SelectState({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select State" />
      </SelectTrigger>
      <SelectContent>
        {malaysianStates.map(state => (
          <SelectItem key={state} value={state}>{state}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
