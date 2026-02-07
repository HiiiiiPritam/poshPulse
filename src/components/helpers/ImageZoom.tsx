import Image from 'next/image';
import React from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const ImageZoom = ({ imageSrc, altText }:{imageSrc: string, altText: string}) => {
  return (
      <Zoom>
        <Image
          width={500}
          height={500}
          src={imageSrc} 
          alt={altText} 
          className="w-full h-[300px] md:h-[600px] object-contain border"
        />
      </Zoom>
  );
};

export default ImageZoom;
