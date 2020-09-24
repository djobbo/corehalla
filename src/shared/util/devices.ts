const sizes = {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
};

export const devices = {
    mobile: `only screen and (min-width: ${sizes.mobile})`,
    tablet: `only screen and (min-width: ${sizes.tablet})`,
    desktop: `only screen and (min-width: ${sizes.desktop})`,
};
