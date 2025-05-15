import { useRef, useEffect } from "react"

interface DonutProps{
    progress:number
}


export function Donut({progress}:DonutProps){
    const refTimerCircle = useRef<SVGCircleElement>(null)
    const refBackgroundCircle = useRef<SVGCircleElement>(null)
    const hex = function (x: number) {
        const strx = x.toString(16);
        return strx.length == 1 ? '0' + strx : strx;
      };
      const getIntColor = function (color: string, i1: number, i2: number) {
        return parseInt(color.substring(i1, i2), 16);
      };
      const getColorRatio = function (
        c1: string,
        c2: string,
        ratio: number,
        i1: number,
        i2: number
      ) {
        const color1 = getIntColor(c1, i1, i2);
        const color2 = getIntColor(c2, i1, i2);

        return Math.ceil(color1 + (color2 - color1) * ratio);
      };

    useEffect(()=>{
        if(refTimerCircle.current && refBackgroundCircle.current){
            
            let ratio = 1-progress
            ratio = Math.min(1,Math.max(0,ratio))

            refTimerCircle.current.style.strokeDashoffset = `${( (1-ratio ) ) * 275}px`

            const color2 = 'FF3244';
            const color1 = '00C49F';

            const r = getColorRatio(color1, color2, ratio, 0, 2);
            const g = getColorRatio(color1, color2, ratio, 2, 4);
            const b = getColorRatio(color1, color2, ratio, 4, 6);
            //   console.log(r, g, b);
            const middle = hex(r) + hex(g) + hex(b);
            refTimerCircle.current.style.stroke = `#${middle}`;
            

        }
    },[progress])

    return (
        <svg    
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 100 100"
                    height="70"
                    width="70"
                  >
                    <circle
                      ref={refBackgroundCircle}
                      fill="none"
                      stroke="#2E3234"
                      strokeWidth="10"
                      strokeMiterlimit="0"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeDasharray="275"
                      strokeLinecap="round"
                      transform="rotate(-90 ) translate(-100 0)"
                      
                    ></circle>
                    {progress>0 && (
                    <circle
                      ref={refTimerCircle}
                      fill="none"
                      stroke="#2E3234"
                      strokeWidth="10"
                      strokeMiterlimit="0"
                      cx="50"
                      cy="50"
                      r="45"
                      strokeDasharray="275"
                      strokeDashoffset="0"
                      strokeLinecap="square"
                      transform="rotate(-90 ) translate(-100 0)"
                    ></circle>
                    )}
                    
                  </svg>
    )
}