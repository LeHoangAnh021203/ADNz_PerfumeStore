"use client"

import type React from "react"
import { useState } from "react"

interface OptionData {
  id: number
  background: string
  icon: string
  main: string
  sub: string
  subLink?: string
  defaultColor: string
}

const OptionsSelector: React.FC = () => {
  const [activeOption, setActiveOption] = useState<number>(0)

  const optionsData: OptionData[] = [
    {
      id: 0,
      background: "https://i.pinimg.com/736x/0c/31/0f/0c310f251f1cc2720fde836b5f64b1bd.jpg",
      icon: "https://i.pinimg.com/1200x/ff/ab/74/ffab7433fefae12073dfcb4f74119c6f.jpg",
      main: "ADNzPerfume",
      sub: "Click Here!",
      subLink: "https://www.facebook.com/profile.php?id=61573770329166",
      defaultColor: "#ED5565",
    },
    {
      id: 1,
      background: "https://i.pinimg.com/736x/37/11/dc/3711dc26414d1534b299e26e964c6497.jpg",
      icon: "https://i.pinimg.com/1200x/74/5e/61/745e6171871cb9a031d67c24056288eb.jpg",
      main: "adnz.perfume",
      sub: "Click Here!",
      subLink: "https://www.instagram.com/adnz.perfume/",
      defaultColor: "#ED5565",
    },
    {
      id: 2,
      background: "https://i.pinimg.com/1200x/37/ae/46/37ae46c133dd8930fad29a4f6f4715dd.jpg",
      icon: "https://i.pinimg.com/1200x/f1/4b/78/f14b78b8201a1ffcde5ab72a5df6f409.jpg",
      main: "adnz.perfume",
      sub: "Click Here!",
      subLink: "https://www.tiktok.com/@tim.nc.bng?_r=1&_t=ZS-93pXt3CEuCS",
      defaultColor: "#ED5565",
    },
    {
      id: 3,
      background: "https://i.pinimg.com/736x/17/d9/7f/17d97fca193cc7117cbee99569dcc007.jpg",
      icon: "https://i.pinimg.com/1200x/80/53/2b/80532bb5ec721b31e9de652609ea2206.jpg",
      main: "ADNz_Perfume",
      sub: "Click Here!",
      subLink: "https://web.whatsapp.com/",
      defaultColor: "#ED5565",
    },
    {
      id: 4,
      background: "https://i.pinimg.com/736x/a4/b5/b3/a4b5b36e8b526d64f6db30a4bb655704.jpg",
      icon: "https://i.pinimg.com/736x/02/db/bf/02dbbf824428cffc1aa690d8723d4d69.jpg",
      main: "ADNz_Perfume",
      sub: "Click Here!",
      subLink: "https://www.threads.com/@adnz.perfume?igshid=NTc4MTIwNjQ2YQ==",
      defaultColor: "#ED5565",
    },
  ]

  const handleOptionClick = (optionId: number) => {
    setActiveOption(optionId)
  }

  const isUrl = (value: string): boolean => /^https?:\/\/\S+$/i.test(value)
  const isImageIcon = (value: string): boolean =>
    /^(https?:\/\/|\/)/i.test(value) || /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(value)

  const formatLinkLabel = (url: string): string => {
    try {
      const parsed = new URL(url)
      const readable = `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname}${parsed.search}`
      return readable.length > 38 ? `${readable.slice(0, 35)}...` : readable
    } catch {
      return url
    }
  }

  const styles = `
    body {
      margin: 0;
      padding: 0;
    }
    
    .options-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      height: 50vh;
      font-family: 'Roboto', sans-serif;
      transition: 0.25s;
    }
    
    .options-wrapper {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      overflow: hidden;
      min-width: 600px;
      max-width: 900px;
      width: calc(100% - 100px);
      height: 400px;
    }
    
    .option-item {
      position: relative;
      overflow: hidden;
      min-width: 60px;
      margin: 10px;
      background-size: auto 120%;
      background-position: center;
      cursor: pointer;
      transition: 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95);
      border-radius: 30px;
      flex-grow: 1;
    }
    
    .option-item.active {
      flex-grow: 10000;
      transform: scale(1);
      max-width: 600px;
      margin: 0px;
      border-radius: 40px;
      background-size: auto 100%;
    }
    
    .option-item.active .option-shadow {
      box-shadow: none;
    }
    
    .option-item:not(.active) .option-shadow {
      bottom: -40px;
      box-shadow: none;
    }
    
    .option-item.active .option-label {
      bottom: 20px;
      left: 20px;
    }
    
    .option-item:not(.active) .option-label {
      bottom: 10px;
      left: 10px;
    }
    
    .option-item.active .option-info > div {
      left: 0px;
      opacity: 1;
    }
    
    .option-item:not(.active) .option-info > div {
      left: 20px;
      opacity: 0;
    }
    
    .option-shadow {
      position: absolute;
      bottom: 0px;
      left: 0px;
      right: 0px;
      height: 120px;
      transition: 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95);
    }
    
    .option-label {
      display: flex;
      position: absolute;
      right: 0px;
      height: 40px;
      transition: 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95);
    }
    
    .option-icon {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      min-width: 40px;
      max-width: 40px;
      height: 40px;
      border-radius: 100%;
      background-color: white;
    }
    
    .option-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 10px;
      color: white;
      white-space: pre;
    }
    
    .option-info > div {
      position: relative;
      transition: 0.5s cubic-bezier(0.05, 0.61, 0.41, 0.95), opacity 0.5s ease-out;
    }
    
    .option-main {
      font-weight: bold;
      font-size: 1.2rem;
    }

    .option-icon-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    
    .option-sub {
      transition-delay: 0.1s;
    }

    .option-sub-link {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    
    .inactive-options {
      display: none;
    }
    
    /* Tablet and Mobile Responsive Styles */
    @media screen and (max-width: 1024px) {
      .options-container {
        padding: 20px;
        height: auto;
        min-height: 100vh;
        flex-direction: column;
      }
      
      .options-wrapper {
        display: flex;
        flex-direction: column;
        min-width: auto;
        max-width: none;
        width: 100%;
        height: auto;
        align-items: center;
      }
      
      /* Active option takes full width and proper height */
      .option-item.active {
        display: block;
        width: 100%;
        max-width: 500px;
        height: 300px;
        margin: 0 0 30px 0;
        border-radius: 25px;
        background-size: cover;
        flex-grow: 0;
        transform: none;
      }
      
      /* Ensure content is in bottom left */
      .option-item.active .option-label {
        bottom: 25px;
        left: 25px;
        right: auto;
        height: 40px;
      }
      
      .option-item.active .option-info > div {
        left: 0px;
        opacity: 1;
      }
      
      /* Hide inactive options from normal flow and show as icons */
      .option-item:not(.active) {
        display: none;
      }
      
      /* Show inactive options as circular icons */
      .inactive-options {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 15px;
        width: 100%;
        max-width: 500px;
      }
      
      .inactive-option {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        position: relative;
        cursor: pointer;
        transition: transform 0.3s ease;
        overflow: hidden;
      }
      
      .inactive-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 50%;
      }
      
      .inactive-option-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        z-index: 1;
      }
    }
    
    /* Mobile specific adjustments */
    @media screen and (max-width: 768px) {
      .option-item.active {
        height: 250px;
        border-radius: 20px;
        max-width: 400px;
      }
      
      .option-item.active .option-label {
        bottom: 20px;
        left: 20px;
      }
      
      .inactive-option {
        width: 60px;
        height: 60px;
      }
      
      .inactive-option-inner {
        width: 35px;
        height: 35px;
        font-size: 16px;
      }

      .inactive-option-inner .option-icon-image {
        width: 20px;
        height: 20px;
      }
    }
    
    /* Small mobile adjustments */
    @media screen and (max-width: 480px) {
      .option-item.active {
        height: 220px;
        border-radius: 18px;
      }
      
      .option-item.active .option-label {
        bottom: 18px;
        left: 18px;
      }
      
      .option-main {
        font-size: 1.1rem;
      }
      
      .inactive-option {
        width: 50px;
        height: 50px;
      }
      
      .inactive-option-inner {
        width: 30px;
        height: 30px;
        font-size: 14px;
      }

      .inactive-option-inner .option-icon-image {
        width: 18px;
        height: 18px;
      }
    }
  `

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="options-container">
        <div className="options-wrapper">
          {optionsData.map((option) => (
            <div
              key={option.id}
              className={`option-item ${activeOption === option.id ? "active" : ""}`}
              style={
                {
                  backgroundImage: `url(${option.background})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                  "--defaultBackground": option.defaultColor,
                } as React.CSSProperties
              }
              onClick={() => handleOptionClick(option.id)}
            >
              <div className="option-shadow"></div>
              <div className="option-label">
                <div
                  className="option-icon"
                  style={{
                    color: "#C0C0C0",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.5)",
                    filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))",
                  }}
                >
                  {isImageIcon(option.icon) ? (
                    <img src={option.icon} alt={`${option.main} icon`} className="option-icon-image" />
                  ) : (
                    <i className={option.icon}></i>
                  )}
                </div>
                <div className="option-info">
                  <div className="option-main font-mono">{option.main}</div>
                  <div className="option-sub font-mono">
                    {option.subLink ? (
                      <a
                        className="option-sub-link"
                        href={option.subLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {option.sub}
                      </a>
                    ) : isUrl(option.sub) ? (
                      <a
                        className="option-sub-link"
                        href={option.sub}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {formatLinkLabel(option.sub)}
                      </a>
                    ) : (
                      option.sub
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="inactive-options">
            {optionsData.map(
              (option) =>
                option.id !== activeOption && (
                  <div
                    key={option.id}
                    className="inactive-option"
                    style={{
                      backgroundImage: `url(${option.background})`,
                    }}
                    onClick={() => handleOptionClick(option.id)}
                  >
                    <div className="inactive-option-inner">
                      {isImageIcon(option.icon) ? (
                        <img src={option.icon} alt={`${option.main} icon`} className="option-icon-image" />
                      ) : (
                        <i className={option.icon} style={{ color: option.defaultColor }}></i>
                      )}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default OptionsSelector
