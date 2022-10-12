import { theme } from "ui/theme"

type LandingBackgroundProps = {
    className?: string
    fill?: string
}

export const LandingBackground = ({
    className,
    fill = theme.colors.bgVar2.toString(),
}: LandingBackgroundProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={fill}
            viewBox="0 0 1930 1266"
            className={className}
            preserveAspectRatio="xMidYMid slice"
        >
            <path d="M96.97 446.437c0 2.2 52.911-69.446 94.8-37.479L89.254 590.84s-5.512 25.353 14.33 30.865c19.842 5.512 37.479-13.228 37.479-13.228s97-176.37 98.106-177.472c44.093 8.818 18.739 98.106 19.842 98.106 77.162 12.125 233.69-76.06 170.858-288.806 1.1 2.2-34.172 54.013-90.39 46.3 0 0 11.023-41.888-16.535-57.32-27.558-15.432-51.808 16.535-51.808 16.535s-38.581-38.581-5.512-110.231c0-1.106-259.044 45.191-168.654 310.848Zm1627.62 21.971c.66.333-12.59-26.169 3.21-33.757l38.43 57.85s6.68 5.463 11.31.414c4.63-5.048 1.74-13.105 1.74-13.105s-37.63-55.387-37.79-55.879c9.28-11.737 31.91 9.262 32.08 8.935 15.24-21.038 12.75-80.748-59.8-94.255.82.005 10.85 18.285.07 33.782 0 0-10.75-9.593-19.48-3.756-8.74 5.837-2.93 17.852-2.93 17.852s-17.26 5.609-33.5-15.014c-.33-.164-25.72 83.604 66.66 96.933ZM354.176 611.626c-1.124.375 32.233-1.5 16.116 68.963 1.124.75 3 22.113 28.485 11.619 0-.375-12.743-35.231 24.737-34.856.75.375 6.746-31.108 43.477-34.856 36.731-3.748 2.249-65.59 2.249-65.59s-105.319 25.111-115.064 54.72Zm514.198-177.868c.599.479-12.167-16.95 31.719-33.03.01-.874 10.935-9.415-3.733-19.539-.203.132-14.616 19.32-27.615-1.136-.06-.538-19.245 7.3-34.215-11.298-14.971-18.598-36.359 21.885-36.359 21.885s50.714 48.263 70.203 43.118ZM83.733 1092.2c-.114.76 8.595-19 44.443 10.96.761-.43 13.614 4.76 15.048-12.99-.215-.11-24.028-3-12.814-24.48.436-.32-15.935-13.01-7.315-35.26 8.62-22.25-37.111-20.54-37.111-20.54s-16.442 68.01-2.25 82.31ZM1646.44 67.407l43.43-27.36-2.63 54.664-15.3-8.506-45.52 106.311 11.66 35.691-13.53 30.019-17.06-41.759-37.73 3.021 16.92-30.104 27.08-5.957 45-106.195-12.32-9.825Z" />
            <path d="M1681.99 100.25s7.37 11.17 16.55 11.035c9.17-.135 28.87-14.818 49.72 16.413 20.85 31.232 20.45 90.958 31.79 117.909 11.34 26.952 36.29 30.331 36.29 30.331s-43.5 14.894-55.04-36.382c-11.54-51.276-12.08-108.867-39.49-109.769-27.4-.901-48.2-16.753-48.2-16.753l8.38-12.784Zm-31.57-1.2s-17.01-3.16-18.38-20.227c-1.36-17.066-24.05-44.583-65.26-38.915-41.2 5.668-89.17 41.334-124.01 17.825.42 1.297 17.19 38.56 64.86 26.558 47.66-12.002 61.67-19.986 84-18.704 22.34 1.282 21.97 39.058 48.89 49.046.03.101 9.9-15.583 9.9-15.583Zm-722.845 924.21-17.452 36.54-14.912-33.12 11.618-2.3-5.095-83.565-17.652-15.28-1.039-23.917 22.671 16.263 21.407-19.646-.937 25.571-14.227 16.313 5.368 83.251 10.25-.11Z" />
            <path d="M898.541 1012.34s-8.109-3.05-13.813 1.64c-5.703 4.69-13.455 23.46-36.272 15.03-22.817-8.42-41.233-44.762-56.759-55.375-15.526-10.613-32.204-.133-32.204-.133s22.586-30.848 45.839-5.621c23.253 25.228 41.59 59.799 59.035 46.589 10.418-7.9 22.705-12.78 35.428-14.07l-1.254 11.94Zm24.717-.37s10.468-5.94 16.065 2.8c5.597 8.74 26.151 13.58 47.731-8.12 21.576-21.696 38.476-62.885 64.726-65.719-.6-.522-20.58-13.38-44 14.702-23.425 28.083-29.047 38.781-41.975 48.157-12.928 9.37-23.411-11.501-41.384-4.829-.048-.04-1.163 13.009-1.163 13.009Zm201.422-841.65-36.1-23.374s-16.84 44.688-44.2 24.812c-15.67-6.381-26.01-3.408-26.01-3.408l-42.247-25.143s-12.482-7.979-16.58-.362c-4.098 7.616 6.48 16.371 6.48 16.371l42.387 24.507s2.93 14.008 18.94 20.653c27.74 20.162-2.9 53.292-2.9 53.292l42.17 22.464 22.25-45.423s12.99-2.038 15.46-7.751c2.47-5.712-2.25-18.629-2.25-18.629l22.6-38.009Zm712.52 765.048-32.91 27.695s37.82 29.167 10.81 49.517c-10.68 13.12-10.87 23.88-10.87 23.88l-36.39 33.05s-11.28 9.6-5.19 15.75c6.08 6.14 17.55-1.41 17.55-1.41l35.82-33.37s14.26 1.3 25.29-12.08c27.39-20.63 50.12 18.36 50.12 18.36l33.81-33.76-36.93-34.562s1.84-13.011-2.9-17.046-18.47-3.298-18.47-3.298l-29.74-32.726ZM1219.77 784.4l-24.52-6.994s-1.81 28.258-20.76 21.729c-9.99-.9-15.34 2.576-15.34 2.576l-28.31-6.932s-8.46-2.361-9.46 2.667c-1 5.029 6.51 8.159 6.51 8.159l28.28 6.547a18.571 18.571 0 0 0 6.17 5.901 18.569 18.569 0 0 0 8.15 2.528c19.22 6.624 7.59 30.718 7.59 30.718l27.81 5.424 4.74-29.608s7.01-3.406 7.42-7.073c.4-3.666-4.51-10.171-4.51-10.171l6.23-25.471Zm-1020.975 1.166c15.74 0 28.5-12.983 28.5-29 0-16.016-12.76-29-28.5-29s-28.5 12.984-28.5 29c0 16.017 12.76 29 28.5 29Zm94 402.004c25.129 0 45.5-20.6 45.5-46 0-25.41-20.371-46-45.5-46s-45.5 20.59-45.5 46c0 25.4 20.371 46 45.5 46ZM651.59 654.588c30.766 21.08 41.021 20.51 57.543 54.694.57.57 22.789-27.347 22.789-27.347l75.2 87.169s7.976 6.837 15.952 0 0-22.22 0-22.22l-71.216-92.3s63.815-111.664 147.566-54.119c.57.568-92.866-127.622-247.834 54.123Zm667.13 406.022s57.49-99.143 170.4-181.48c2.77-.956 22.99 122.03-35.19 246.06 1.86.91-59.71 4.19-59.71 4.19l-70.63 118.76s-12.12 18.15-28.91 9.96c-16.79-8.19-10.51-30.51-10.51-30.51l62.81-122.49-28.26-44.49ZM394.54 887.405l16.28 35.816s84.19-97.677 152.566-120.472c.465-.465-1.861 50.7-119.541 151.636 0-.93 33.49 15.815 33.49 15.815l-21.862 22.327-41.862-22.327-32.095 31.63s5.582 12.56-3.256 18.61c-8.838 6.04-26.513 9.3-34.421-2.79-7.908-12.1-7.442-25.123 3.721-31.169 11.163-6.046 16.745 0 16.745 0l30.234-32.095-21.861-46.979 21.862-20.002Zm975.37-464.892 27.29-12.406s-74.44-64.158-91.81-116.264c-.35-.354 38.64 1.418 115.56 91.1-.71 0 12.05-25.521 12.05-25.521l17.02 16.66-17.02 31.9 24.1 24.458s9.57-4.254 14.18 2.481c4.61 6.735 7.09 20.2-2.13 26.23-9.21 6.03-19.14 5.671-23.75-2.836-4.6-8.507 0-12.761 0-12.761l-24.45-23.04-35.8 16.659-15.24-16.66Zm-301.18 702.227 22.31 1.38s-26.58-68.3-19.79-108.69c-.11-.36 24.95 14.45 44.23 100.42-.46-.25 16.87-12.59 16.87-12.59l5.38 16.92-22.37 15.06 7.32 24.54s7.79.55 8.47 6.59c.68 6.05-2.4 15.79-10.57 16.54-8.18.74-14.59-2.97-14.65-10.18-.06-7.21 4.46-8.4 4.46-8.4l-8.05-23.73-29.4-1.55-4.21-16.31Zm656.48-267.206c-.5-.643.4 32.314-19.1 32.541l-11.57-76.412s-4.17-8.651-11.21-5.737c-7.04 2.914-7.91 12.405-7.91 12.405s11.92 73.549 11.85 74.121c-14.87 7.48-27.83-24.338-28.15-24.086-25.27 14.054-50.82 75.455 16.01 123.174-.83-.391-2.35-23.542 15.8-34.108 0 0 6.34 14.727 17.89 12.947 11.56-1.78 11.34-16.633 11.34-16.633s20.05 2.456 26.74 30.89c.25.321 65.24-72.236-21.69-129.102ZM598.567 945.508c-.513.1 18.525 9.158 12.989 20.334l-46.891-15.609s-6.137-.131-6.524 4.724c-.387 4.855 4.766 8.11 4.766 8.11s45.362 14.579 45.668 14.785c-.057 10.643-21.949 8.785-21.898 9.045.667 18.473 28.223 50.863 74.82 26.653-.462.36-14.093-5.5-14.841-18.914 0 0 10.231.669 12.572-6.431 2.341-7.1-6.185-11.289-6.185-11.289s7.226-10.708 25.372-6.26c.251-.049-22.203-58.148-79.848-25.148ZM1267.2 198.996c.47-.704-17.41 14.969-39.26-31.605-.96.073-11.38-11.085-21.07 5.971.17.21 22.59 14.168 1.41 30.384-.58.118 9.85 20.4-9.1 38.599-18.96 18.2 27.49 37.763 27.49 37.763s48.05-60.239 40.53-81.112Zm-157.49 364.2c-.54-.006 14.25 4.18-3.33 32.419.38.495-2.01 10.071 10.65 9.326.06-.162-.26-17.236 15.99-11.456.27.275 7.6-12.524 24.15-8.645 16.55 3.878 10.8-28.2 10.8-28.2s-49.58-4.865-58.26 6.556Zm447.98 100.566 9.26 39.777-33.45-16.283 7.99-9.265-57.88-62.01-24.22-.581-16.23-18.017 28.94-1.885 4.83-29.125 15.68 20.583-1.11 21.906 57.9 61.576 8.29-6.676Z" />
            <path d="M1528.29 674.45s-8.58 2.834-10.21 10.179c-1.64 7.344 4.1 27.022-19.91 35.13-24.01 8.109-62.37-8.448-81.84-6.744-19.48 1.705-26.34 20.646-26.34 20.646s-1.41-38.684 33.76-33.935c35.16 4.749 72.32 19.979 78.05-1.598 3.41-12.891 10.29-24.623 19.84-33.825l6.65 10.147Zm17.53-16.599s4.67-11.424 14.77-8.189c10.09 3.235 29.8-6.244 33.42-37.203 3.63-30.959-8.96-74.17 10.47-93.356-.82-.02-25.17 2.807-26.21 39.961-1.05 37.154 1.22 49.176-3.26 64.88-4.48 15.704-26.26 6.109-36.54 22.954-.07-.001 7.35 10.953 7.35 10.953ZM822.694 214.912l-5.674-27.763 22.698 11.612-5.658 6.382 38.692 43.646 16.628.608 10.833 12.675-19.913 1.07-3.823 20.227-10.408-14.457 1.146-15.233-38.716-43.347-5.805 4.58Z" />
            <path d="M842.814 208.2s5.96-1.909 7.217-7.028c1.256-5.12-2.362-18.927 14.335-24.392 16.696-5.466 42.852 6.431 56.308 5.405 13.456-1.026 18.515-14.211 18.515-14.211s.298 27.055-23.861 23.435c-24.159-3.619-49.513-14.575-53.839.459-2.579 8.985-7.528 17.129-14.269 23.483l-4.406-7.151Zm-12.335 10.652s-3.382 7.89-10.211 5.558c-6.83-2.332-20.424 4.083-23.421 25.538-2.997 21.454 4.847 51.554-8.725 64.707.559.021 17.208-1.735 18.553-27.514 1.345-25.78.003-34.142 3.325-45.003 3.322-10.861 18.005-4.018 25.303-15.622.044.001-4.824-7.664-4.824-7.664Zm143.06 665.971 30.491-2.703s-10.128-32.444 13.93-33.279c11.58-3.283 16.08-9.481 16.08-9.481l34.71-4.397s10.5-.991 9.46-7.061c-1.05-6.07-10.81-6.345-10.81-6.345l-34.51 4.818s-7.77-6.576-19.67-3.29c-24.39.837-21.715-31.167-21.715-31.167l-33.494 5.876 7.412 35.224s-6.39 6.83-5.275 11.118c1.115 4.288 9.418 9.464 9.418 9.464l3.973 31.223Zm-676.68-186.8 6.308-29.952s-33.984.225-27.767-23.025c.238-12.033-4.377-18.149-4.377-18.149l5.919-34.479s2.114-10.329-3.996-11.103c-6.109-.774-9.22 8.485-9.22 8.485l-5.457 34.408s-8.557 5.52-8.884 17.854c-6.313 23.573-36.143 11.681-36.143 11.681l-4.15 33.748 35.852 3.185s4.668 8.104 9.095 8.288c4.426.184 11.799-6.247 11.799-6.247l31.021 5.306Zm631.849-59.291c-13.927 10.887-16.391 31.002-5.504 44.928 10.886 13.927 31.001 16.391 44.928 5.504 13.926-10.886 16.39-31.001 5.504-44.928-10.887-13.926-31.002-16.39-44.928-5.504Zm203.962-261.607c-26.39-2.843-32.62.971-54.5-14.887-.55-.165-5.07 24.823-5.07 24.823l-76.524-29.289s-7.304-1.597-10 5.377c-2.695 6.974 7.49 13.928 7.49 13.928l75.754 33.849s-2.36 91.505-74.252 83.667c-.554-.172 101.232 48.689 137.102-117.468ZM563.555 1085.24c-8.595 14.63-8.01 19.27-23.007 27.86-.241.28 13.14 9.48 13.14 9.48l-37.194 36.91s-2.851 3.84.507 7.25c3.358 3.4 10.088-.71 10.088-.71l39.65-35.26s52.728 25.42 29.26 65.27c-.242.28 54.997-46.21-32.444-110.8Zm681.965-412.133s31.89 15.629 59.78 48.745c.35.837-37.22 9.747-76.82-5.557-.24.596-2.58-18.364-2.58-18.364l-38.23-19.265s-5.88-3.355-3.71-8.722c2.17-5.367 9.21-3.907 9.21-3.907l39.21 16.767 13.14-9.697ZM641.293 448.852s11.188 80.825-16.072 176.497c-1.139 1.752-66.377-58.388-88.089-153.473-1.445.308 31.66-28.516 31.66-28.516l-12.413-97.582s-1.151-15.493 11.859-18.257c13.009-2.763 19.262 12.513 19.262 12.513l18.44 96.248 35.353 12.57Zm-46.972-225.025s-21.787-44.905-24.01-105.718c.331-1.234 49.652 21.422 80.256 72.638.783-.452-13.03 22.575-13.03 22.575l25.666 54.425s3.598 8.796-3.449 12.863c-7.046 4.067-13.571-3.639-13.571-3.639l-28.92-52.509-22.942-.635Zm149.244 585.046-9.866 18.92s69.86 3.347 102.44 24.949c.354.044-22.286 16.141-104.724-.428.394-.308 4.428 19.593 4.428 19.593l-16.844-1.884-4.44-25.347-24.233-3.146s-3.502 6.58-9.038 4.823c-5.537-1.757-12.839-8.225-10.31-15.64 2.529-7.416 8.247-11.57 14.56-8.821 6.314 2.75 5.593 7.155 5.593 7.155l23.811 2.201 12.773-25.035 15.85 2.66ZM25.216 105.685C11.289 116.572 9.1 137.04 20.328 151.401c11.227 14.362 31.618 17.179 45.544 6.292 13.926-10.886 16.115-31.354 4.888-45.716-11.227-14.361-31.618-17.178-45.544-6.292Z" />
        </svg>
    )
}