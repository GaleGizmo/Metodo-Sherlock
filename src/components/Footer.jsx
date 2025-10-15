import React from 'react'

export default function Footer({onPrev, onNext, progressText}){
  return (
    <div className="bottom-bar footer">
      <div className="center-controls">
        <button className="btn btn-nav" onClick={onPrev}>Anterior</button>
        <div className="progress">{progressText}</div>
        <button className="btn btn-nav" onClick={onNext}>Siguiente</button>
      </div>
      <div className="instructions">Pulsa una opción para valorar la noticia</div>
    </div>
  )
}
