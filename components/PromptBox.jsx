"use client"
import { assets } from '../assets/assets'
import React, { useState } from 'react'
import Image from 'next/image'

function PromptBox({ isLoading, setIsLoading }) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setIsLoading(true)
    console.log("User Prompt:", prompt)
    // you can add your API call or logic here
    setPrompt("")
    setIsLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full ${
        false ? "max-w-3xl" : "max-w-2xl"
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      {/* Text area */}
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent text-white"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      {/* Bottom buttons */}
      <div className="flex items-center justify-between text-sm mt-2">
        {/* Left side buttons */}
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.deepthink_icon} alt="DeepThink" width={16} height={16} />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.search_icon} alt="Search" width={16} height={16} />
            Search
          </p>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Image
            className="w-4 cursor-pointer"
            src={assets.pin_icon}
            alt="Pin"
            width={16}
            height={16}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`${
              prompt ? "bg-blue-500" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer transition`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt="Send"
              width={14}
              height={14}
            />
          </button>
        </div>
      </div>
    </form>
  )
}

export default PromptBox
