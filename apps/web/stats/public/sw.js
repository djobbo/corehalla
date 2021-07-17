if (!self.define) {
    const e = (e) => {
            'require' !== e && (e += '.js')
            let n = Promise.resolve()
            return (
                i[e] ||
                    (n = new Promise(async (n) => {
                        if ('document' in self) {
                            const i = document.createElement('script')
                            ;(i.src = e), document.head.appendChild(i), (i.onload = n)
                        } else importScripts(e), n()
                    })),
                n.then(() => {
                    if (!i[e]) throw new Error(`Module ${e} didn’t register its module`)
                    return i[e]
                })
            )
        },
        n = (n, i) => {
            Promise.all(n.map(e)).then((e) => i(1 === e.length ? e[0] : e))
        },
        i = { require: Promise.resolve(n) }
    self.define = (n, s, a) => {
        i[n] ||
            (i[n] = Promise.resolve().then(() => {
                let i = {}
                const r = { uri: location.origin + n.slice(1) }
                return Promise.all(
                    s.map((n) => {
                        switch (n) {
                            case 'exports':
                                return i
                            case 'module':
                                return r
                            default:
                                return e(n)
                        }
                    }),
                ).then((e) => {
                    const n = a(...e)
                    return i.default || (i.default = n), i
                })
            }))
    }
}
define('./sw.js', ['./workbox-ef35eb5c'], function (e) {
    'use strict'
    importScripts(),
        self.skipWaiting(),
        e.clientsClaim(),
        e.precacheAndRoute(
            [
                { url: '/_next/static/Zx8u_zzQir9EJ3C8hiHZ7/_buildManifest.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/Zx8u_zzQir9EJ3C8hiHZ7/_ssgManifest.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                {
                    url: '/_next/static/chunks/3586c7091d0dff502d92c7e7c8f428db881fe227.097e1c44338eecf1927f.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                {
                    url: '/_next/static/chunks/597b5f1f3847c62ae19586173290c375e4faf8d1.8387e6240fb7c3b58b36.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                { url: '/_next/static/chunks/commons.32060d0ddffa59fa2db2.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                {
                    url: '/_next/static/chunks/ee02e74541a7e0e0ca916a89d30dd6c383c2d225.cffb09a33d4f0f335bc2.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                { url: '/_next/static/chunks/framework.2be05ba65a443130f4a9.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/chunks/main-13fcd23978280a48cdf4.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/chunks/pages/_app-162040739ff34fa6a7a9.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/chunks/pages/_error-db8915c9946ef0fd197c.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                {
                    url: '/_next/static/chunks/pages/favorites-8c41b3e39eec486009e4.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                { url: '/_next/static/chunks/pages/index-a6b82002539b875743bd.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                {
                    url: '/_next/static/chunks/pages/privacy-fcd541a4e70d4c7f6f18.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                {
                    url: '/_next/static/chunks/pages/rankings/%5B[...rankingsOptions%5D%5D-b151c38074ff79378f4a.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                {
                    url: '/_next/static/chunks/pages/stats/player/%5Bid%5D-124a76b8c13bea56260d.js',
                    revision: 'Zx8u_zzQir9EJ3C8hiHZ7',
                },
                { url: '/_next/static/chunks/polyfills-8663811501b5bd5e5ef4.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/chunks/webpack-50bee04d1dc61f8adf5b.js', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/042ba47f82b8f6656269.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/20a2517fad278051ec70.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/459661fc6bebdee83510.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/68fde64550205d9b3e57.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/7dbbfabc188129f3b94a.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/_next/static/css/f4e760a3591390f99615.css', revision: 'Zx8u_zzQir9EJ3C8hiHZ7' },
                { url: '/favicon.ico', revision: '21b739d43fcb9bbb83d8541fe4fe88fa' },
                { url: '/icons/icon-192x192.png', revision: '2c33eb4cecdddcb5ecb84b836fcef49f' },
                { url: '/icons/icon-256x256.png', revision: '56a879cc9415cdbde672e152ef50fa39' },
                { url: '/icons/icon-384x384.png', revision: 'f6b8b723965a963aba0d04d620669c1f' },
                { url: '/icons/icon-512x512.png', revision: '45d30951dce61a4a7de944f55d79e921' },
                { url: '/images/Ada Landing.png', revision: '97d6497dd2a229dd4b0c20c24277bb5c' },
                { url: '/images/Bodvar Landing.png', revision: '15308903cbbb793742336e96f6870818' },
                { url: '/images/Brynn_BP3_Landing.webm', revision: '5cfd8683ab9873e58cfdd531c8dbf639' },
                { url: '/images/Landing_Preview.jpg', revision: '9bad9a20b83d535aa332a0400b1def0b' },
                { url: '/images/Nix Landing.webp', revision: 'f84673ee536858e605c148369facbba5' },
                { url: '/images/favicon.png', revision: '49d3839ad0fe000a0b4c5f20fdad2e38' },
                { url: '/images/icons/colors/37px-Color_Home_Team.png', revision: '09482c816e0b7e6c389aec1d8bf2f8cd' },
                { url: '/images/icons/colors/50px-Color_Black.png', revision: '9090136c89d9389c3083444c605d8dd0' },
                { url: '/images/icons/colors/50px-Color_Blue.png', revision: '1cfb2cdbf2b373db403560dea493babe' },
                { url: '/images/icons/colors/50px-Color_Brown.png', revision: '4e8c0179a87c553886a20a24bcc7c0bd' },
                { url: '/images/icons/colors/50px-Color_Classic.png', revision: 'f696f9579a611ef3f41bb3b5eea56d91' },
                { url: '/images/icons/colors/50px-Color_Community.png', revision: '65cd35fadf15ce4d3374c0c7fc956925' },
                { url: '/images/icons/colors/50px-Color_Cyan.png', revision: 'd5f37984d477887f1aae0047de894af7' },
                { url: '/images/icons/colors/50px-Color_Goldforged.png', revision: 'e3c06873ddffea839c5cafd6cd10a275' },
                { url: '/images/icons/colors/50px-Color_Gray.png', revision: '9e8948f444d10ab3720d2a994dce126d' },
                { url: '/images/icons/colors/50px-Color_Green.png', revision: 'a4cdedfcf7948ce9c7f3ab6f0fdad51d' },
                { url: '/images/icons/colors/50px-Color_Haunting.png', revision: 'a11deb89d0c9c7e05fffb576ee93635b' },
                { url: '/images/icons/colors/50px-Color_Heatwave.png', revision: 'fcb80ed0fb26ec7007751f044787ebb0' },
                { url: '/images/icons/colors/50px-Color_Lovestruck.png', revision: 'e40fef272646cdb21472239148115e68' },
                {
                    url: '/images/icons/colors/50px-Color_Lucky_Clover.png',
                    revision: '0b6992d8a345fb30b5d562edc54ce6a6',
                },
                { url: '/images/icons/colors/50px-Color_Orange.png', revision: '5ffa8ec6e2a69b313e49056110e25342' },
                { url: '/images/icons/colors/50px-Color_Pink.png', revision: '909db228559e05cce440be0a1bf502e5' },
                { url: '/images/icons/colors/50px-Color_Purple.png', revision: '87c614b0c75932b1fddd5e6dd57010d7' },
                { url: '/images/icons/colors/50px-Color_Red.png', revision: 'e3309ecf5d539b68911c6a99f7b10f42' },
                { url: '/images/icons/colors/50px-Color_Skyforged.png', revision: '3712a20fe57a027630ddc11fe9e28cbe' },
                { url: '/images/icons/colors/50px-Color_Sunset.png', revision: 'c761a925a297f8a41db936f37e18a96f' },
                { url: '/images/icons/colors/50px-Color_Team_Blue.png', revision: 'be899a743129e016e5530f25551413ca' },
                { url: '/images/icons/colors/50px-Color_Team_Red.png', revision: '2c20ac93b7a6afd498b3ccb9823fc87c' },
                { url: '/images/icons/colors/50px-Color_White.png', revision: 'a0554a0d8e5b90642e1e8c2f68c37589' },
                {
                    url: '/images/icons/colors/50px-Color_Winter_Holiday.png',
                    revision: 'b4893cdef5e64f02e32ad044d3bc5c8a',
                },
                { url: '/images/icons/colors/50px-Color_Yellow.png', revision: 'df0a5aefa25d8f6de151084767df41cb' },
                { url: '/images/icons/flags/ALL.png', revision: 'c909253009684d448c74e995eedd7208' },
                { url: '/images/icons/flags/AUS.png', revision: '0648c128f0aa11f03818b9427b41b906' },
                { url: '/images/icons/flags/BRZ.png', revision: '891abc59ce3c46cd18a8ba8da7d98faf' },
                { url: '/images/icons/flags/Clanhalla.png', revision: '4e598e562163f2d0e35b334ecbd2cc38' },
                { url: '/images/icons/flags/EU.png', revision: 'e50845b27d0f5800f0b54a3af3b8434d' },
                { url: '/images/icons/flags/JPN.png', revision: '07b794cc9872e109c0d7558c82616338' },
                { url: '/images/icons/flags/SEA.png', revision: '8e17c36950c0180c93090467a4b70a42' },
                { url: '/images/icons/flags/US-E.png', revision: '89c69b93f2bf0ca43976d3192321b694' },
                { url: '/images/icons/flags/US-W.png', revision: '7b2e67ea754ee556187531b1e3343a3a' },
                { url: '/images/icons/legends/Ada.png', revision: '2401bf20d609d849ef7bc493058177fa' },
                { url: '/images/icons/legends/Artemis.png', revision: '20350cdba83aa2cca8e10fa252f299bf' },
                { url: '/images/icons/legends/Asuri.png', revision: 'd5fc63a31bf02d4b2c9f5fcbd7d05838' },
                { url: '/images/icons/legends/Azoth.png', revision: 'b1b7a6baa8af8586cd8345a69a81af4b' },
                { url: '/images/icons/legends/Barraza.png', revision: '65e9bf9cdd1a044d242d25c7e523d12b' },
                { url: '/images/icons/legends/Brynn.png', revision: '2b12c342dccb9a1a3766d044eb2cbeb2' },
                { url: '/images/icons/legends/Bödvar.png', revision: '031e31c227c0e03ccda98e6d2c9d87c4' },
                { url: '/images/icons/legends/Caspian.png', revision: 'a75e9a4bbd9a2a73e6228866749a31d7' },
                { url: '/images/icons/legends/Cassidy.png', revision: '77555a71990d815d01fe21fc4beb8077' },
                { url: '/images/icons/legends/Cross.png', revision: '32c56e640c00929e24dd35fb007cd2fb' },
                { url: '/images/icons/legends/Diana.png', revision: '1f69d41bfb6c6ed4835b89047daa7391' },
                { url: '/images/icons/legends/Dusk.png', revision: 'b9e9b5e90c4448a91445dd57684bf8ae' },
                { url: '/images/icons/legends/Ember.png', revision: 'e5c066468bb571195ec1314f9fb72f81' },
                { url: '/images/icons/legends/Fait.png', revision: '0b6df030267180eb946bd87f7ad3c492' },
                { url: '/images/icons/legends/Gnash.png', revision: 'c88810a737169461f017e24988765498' },
                { url: '/images/icons/legends/Hattori.png', revision: 'e9a908d0e31f478a75ca6b20c5b37b05' },
                { url: '/images/icons/legends/Isaiah.png', revision: 'dedadc0a3b77c300a0687b7a02894acf' },
                { url: '/images/icons/legends/Jaeyun.png', revision: '2e912cab917c5413235cd38e91acbf4f' },
                { url: '/images/icons/legends/Jhala.png', revision: '31eec16e1ed4893ce2fedc4c5f9c0b72' },
                { url: '/images/icons/legends/Jiro.png', revision: '090acf7cdb966ebd196691dcea52de5b' },
                { url: '/images/icons/legends/Kaya.png', revision: 'de0c4fd4aef792403aede792e37a560a' },
                { url: '/images/icons/legends/Koji.png', revision: '4eab42d8d7d7bf129113667322a5bc38' },
                { url: '/images/icons/legends/Kor.png', revision: 'a65d4f395a2aaa6bbd702ffefd48fd72' },
                { url: '/images/icons/legends/Lin Fei.png', revision: '65a88414ee8e5cd44eaaab786fb82437' },
                { url: '/images/icons/legends/Lord Vraxx.png', revision: '88bd48806b137ed6cbb814b7cc26ac5f' },
                { url: '/images/icons/legends/Lucien.png', revision: 'ef9a9875b0439098adbbd677a9d459bb' },
                { url: '/images/icons/legends/Mirage.png', revision: '582cad8be140460e50fc8d9648ff305e' },
                { url: '/images/icons/legends/Mordex.png', revision: '6070461a9b0d56063b4ee2e20ec17243' },
                { url: '/images/icons/legends/Nix.png', revision: '1df262cf170217c348ba70b2707188d3' },
                { url: '/images/icons/legends/Onyx.png', revision: 'a092faf0c1685270fa7967d6c7d12480' },
                { url: '/images/icons/legends/Orion.png', revision: '69e6c39e34890d430ba922baea240c3e' },
                { url: '/images/icons/legends/Petra.png', revision: '9497eeaf8761378784c3277ca6d8082d' },
                { url: '/images/icons/legends/Queen Nai.png', revision: '3b04541281f5cba5742954053acbeba6' },
                { url: '/images/icons/legends/Ragnir.png', revision: '5c0fbfe9d6d16048c5ff6e92932ff8b8' },
                { url: '/images/icons/legends/Rayman.png', revision: '3bb2de419a2e8493c7f5bad68a1ad62a' },
                { url: '/images/icons/legends/Scarlet.png', revision: '1ab94b42502526b06363491020090996' },
                { url: '/images/icons/legends/Sentinel.png', revision: '67c696badbc7ebb982f8512252781bc2' },
                { url: '/images/icons/legends/Sidra.png', revision: '20189e50b384d00ba00ecf5c157bca06' },
                { url: '/images/icons/legends/Sir Roland.png', revision: '0e91ff8209e4c35e8b924b6a2135663f' },
                { url: '/images/icons/legends/Teros.png', revision: '1e14435b733f11e460768a6a242ca6d2' },
                { url: '/images/icons/legends/Thatch.png', revision: 'c0b1eeaa8e64574ee351c87eae1e92f1' },
                { url: '/images/icons/legends/Thor.png', revision: 'b7a9030f1316259570d6d4a7936ba122' },
                { url: '/images/icons/legends/Ulgrim.png', revision: 'c3bd91f6aefc75fc9cc4a41e8d118203' },
                { url: '/images/icons/legends/Val.png', revision: '3a039596961c5092fc0aee8132518268' },
                { url: '/images/icons/legends/Vector.png', revision: '98de491660c83804e1e2d76bf61eb1cc' },
                { url: '/images/icons/legends/Volkov.png', revision: '5d1a22d55cb9ae2e8e4317c735949c13' },
                { url: '/images/icons/legends/Wu Shang.png', revision: 'd6c4920ae6e6588695875bab1f6e9145' },
                { url: '/images/icons/legends/Xull.png', revision: 'f693beaa5024c760e419042f454ba8f5' },
                { url: '/images/icons/legends/Yumiko.png', revision: 'b7d9da1098d24c7aa2cc77099e777a48' },
                { url: '/images/icons/legends/Zariel.png', revision: '7befb520e89dfa541b0537602829400f' },
                { url: '/images/icons/ranked/Bronze 0.png', revision: '8fdfbe7071f130386b59c4495ecbec70' },
                { url: '/images/icons/ranked/Bronze 1.png', revision: '019c2770edb43fd465625ad25c600956' },
                { url: '/images/icons/ranked/Bronze 2.png', revision: '475f2aff0dfebb51668190a0721c35cc' },
                { url: '/images/icons/ranked/Bronze 3.png', revision: 'fe0244c408c82d71a6807d20e0f11320' },
                { url: '/images/icons/ranked/Bronze 4.png', revision: '32a1b9837ffc81884dce09c53ec0ec0f' },
                { url: '/images/icons/ranked/Bronze 5.png', revision: 'caa99d5fa67f1838e3ba4a83368540fd' },
                { url: '/images/icons/ranked/Diamond.png', revision: '1fa4bbaf51f08588ef1df32eb01d22b9' },
                { url: '/images/icons/ranked/Gold 0.png', revision: '36de305afb6610263acafe1e09d4240d' },
                { url: '/images/icons/ranked/Gold 1.png', revision: '08557d0ddc63ccc47c7c989833b59ede' },
                { url: '/images/icons/ranked/Gold 2.png', revision: '80b4aa1a713b827ca687d620ee7756c6' },
                { url: '/images/icons/ranked/Gold 3.png', revision: 'a342ad3d2e480bc8c6a622b062a084f4' },
                { url: '/images/icons/ranked/Gold 4.png', revision: '26c909d77145eb74fac34467123c931c' },
                { url: '/images/icons/ranked/Gold 5.png', revision: 'b8fcc1d4ece48a2d7809eb4638f07920' },
                { url: '/images/icons/ranked/Platinum 0.png', revision: 'd573157bee3da7224d274aa00691b61c' },
                { url: '/images/icons/ranked/Platinum 1.png', revision: '48714bbe47ba63ffe11cf87d0bb737ae' },
                { url: '/images/icons/ranked/Platinum 2.png', revision: 'a25280a62c59a6f4917d89802933a878' },
                { url: '/images/icons/ranked/Platinum 3.png', revision: '630df3e4bdb3bf680e107f8bcc337260' },
                { url: '/images/icons/ranked/Platinum 4.png', revision: 'b14e9cc98f89b5045ced3e11ed9f9262' },
                { url: '/images/icons/ranked/Platinum 5.png', revision: 'fdda44fb74bbd87021f619b85519f42e' },
                { url: '/images/icons/ranked/Silver 0.png', revision: '7ba87c7746fefc9f2a2e643ea07327f2' },
                { url: '/images/icons/ranked/Silver 1.png', revision: 'c487d7e61c3568942efd6cc43ac2a745' },
                { url: '/images/icons/ranked/Silver 2.png', revision: 'c52d48e5de4108ec867598ffbb560be7' },
                { url: '/images/icons/ranked/Silver 3.png', revision: '66ea97cc7f0365b98a0f141bf3f3efcb' },
                { url: '/images/icons/ranked/Silver 4.png', revision: 'e7baa991b26e300850d862b3eb39fb56' },
                { url: '/images/icons/ranked/Silver 5.png', revision: 'a9a56592278ac78ebfcc4a7151619368' },
                { url: '/images/icons/ranked/Tin 0.png', revision: 'd838f54ff5f970b8f9bde3dccb6f71b2' },
                { url: '/images/icons/ranked/Tin 1.png', revision: '1c782194a83f94012abee83bf3b324c9' },
                { url: '/images/icons/ranked/Tin 2.png', revision: '04895367f4d03c5616600de3aa12b96f' },
                { url: '/images/icons/ranked/Tin 3.png', revision: 'ae2bb3a9f397ec9a7a05dbd105c823d2' },
                { url: '/images/icons/ranked/Tin 4.png', revision: '36b889080362564f09f185b8fdd54f73' },
                { url: '/images/icons/ranked/Tin 5.png', revision: 'f64c566194c89da39c9333c7940a18eb' },
                { url: '/images/icons/weapons/Axe.png', revision: 'a33957a6ae66bfc3e2ea909f83b59099' },
                { url: '/images/icons/weapons/Blasters.png', revision: 'b099a96259f2436290e2358c05879690' },
                { url: '/images/icons/weapons/Bow.png', revision: 'f60e4770b2a881e0014c7a486ea84428' },
                { url: '/images/icons/weapons/Cannon.png', revision: 'bf0e8e1704633dd2e3d040e173575b57' },
                { url: '/images/icons/weapons/Gauntlets.png', revision: '3caf6047070cd194d59604f9294167c9' },
                { url: '/images/icons/weapons/Greatsword.png', revision: '0bfeaad1666737ae2bfa437f5131cc09' },
                { url: '/images/icons/weapons/Hammer.png', revision: '7facbd3342e5c57cfb85b79d36960713' },
                { url: '/images/icons/weapons/Katars.png', revision: 'bd90347e72fb601c1a20e720a311bf0a' },
                { url: '/images/icons/weapons/Orb.png', revision: '5b647459768722f897d3c64d6548c460' },
                { url: '/images/icons/weapons/Rocket Lance.png', revision: '895377dc39472fb408bb342e74b40519' },
                { url: '/images/icons/weapons/Scythe.png', revision: '7af1ef32c521bba96fcb2a7c1e8decf2' },
                { url: '/images/icons/weapons/Spear.png', revision: 'a066e02cd15465bcd6f4278c1b3092e0' },
                { url: '/images/icons/weapons/Sword.png', revision: '548342786124344353ce796cd967a293' },
                { url: '/images/logo.png', revision: 'bca026c34f647ecc03d192d91dad52d1' },
                { url: '/images/ranked-banners/Bronze 0.png', revision: '5997681f53f7a58037f4d041e96f1753' },
                { url: '/images/ranked-banners/Bronze 1.png', revision: 'cace4531068b43b75564212b09c017b3' },
                { url: '/images/ranked-banners/Bronze 2.png', revision: '430ac3fc5221c46b049f3246bb7dfee9' },
                { url: '/images/ranked-banners/Bronze 3.png', revision: '4996e87870de4b95d5a316e7b587183f' },
                { url: '/images/ranked-banners/Bronze 4.png', revision: '383f670cf1018c726407f81f04b8d220' },
                { url: '/images/ranked-banners/Bronze 5.png', revision: 'd73c1d257946f7e35c59c15151f64fb2' },
                { url: '/images/ranked-banners/Diamond.png', revision: 'a4a69dc6f1a1fbb8fd5e1b869d449aa9' },
                { url: '/images/ranked-banners/Emerald.png', revision: '356aaf487950854007be68becc7b8dfb' },
                { url: '/images/ranked-banners/Gold 0.png', revision: 'e87cd5397da73e4adaefd19fb3202330' },
                { url: '/images/ranked-banners/Gold 1.png', revision: '9a559d8464d6ef7be57c9145b9d91011' },
                { url: '/images/ranked-banners/Gold 2.png', revision: 'ed438f3511d1a206bedbf1f22d676b90' },
                { url: '/images/ranked-banners/Gold 3.png', revision: 'ddb1a1ed17da60c85316d66513818023' },
                { url: '/images/ranked-banners/Gold 4.png', revision: 'c8a31a6f16b33ee839be5aa7e7ffdaf3' },
                { url: '/images/ranked-banners/Gold 5.png', revision: '63f7182ce355e4e0e46b981644e95e68' },
                { url: '/images/ranked-banners/Platinum 0.png', revision: '0af264ed6423614e9c480c7e8107c40c' },
                { url: '/images/ranked-banners/Platinum 1.png', revision: '983833f89de788f2863aeeb02bd7b84c' },
                { url: '/images/ranked-banners/Platinum 2.png', revision: 'b5b1588d544884c32afa1c1fdf50c69e' },
                { url: '/images/ranked-banners/Platinum 3.png', revision: '8e4021b4880d36a9df6a0b2d825fcad4' },
                { url: '/images/ranked-banners/Platinum 4.png', revision: 'f46dd7a224d32cd72581a37eb505f972' },
                { url: '/images/ranked-banners/Platinum 5.png', revision: '3f760066789a1078d7690cdb375e82c0' },
                { url: '/images/ranked-banners/Silver 0.png', revision: 'fb23e85a1866ce220ba28acedd31b16f' },
                { url: '/images/ranked-banners/Silver 1.png', revision: '66b747b7429e01cd65d3f310ceab2f04' },
                { url: '/images/ranked-banners/Silver 2.png', revision: '7ec08c5ec3b86f7460ced820b906307b' },
                { url: '/images/ranked-banners/Silver 3.png', revision: '32ac87fefb7aa4fb374dda60b2a7a76b' },
                { url: '/images/ranked-banners/Silver 4.png', revision: '5ba1293c16e89823219bd1ef7b9597a8' },
                { url: '/images/ranked-banners/Silver 5.png', revision: '87e3eb4361414be681b310fffd541204' },
                { url: '/images/ranked-banners/Tin 0.png', revision: 'd091d540fa92eb5f10ddc2b78e4e0aae' },
                { url: '/images/ranked-banners/Tin 1.png', revision: 'a3e0a3e7140f3de0ec543acb081bb78a' },
                { url: '/images/ranked-banners/Tin 2.png', revision: 'd4b51e6d0a69813bb3de186046e7e478' },
                { url: '/images/ranked-banners/Tin 3.png', revision: '0ba6415d09794604c5bfa1445898353e' },
                { url: '/images/ranked-banners/Tin 4.png', revision: '7d8d54db67b017297079a4a79be39279' },
                { url: '/images/ranked-banners/Tin 5.png', revision: '18eb00c694a5ff1e073aec7eb5dfbce9' },
                { url: '/manifest.json', revision: '031412db8bfe5d9c87273aeb1bc0204d' },
                { url: '/vercel.svg', revision: '4b4f1876502eb6721764637fe5c41702' },
            ],
            { ignoreURLParametersMatching: [] },
        ),
        e.cleanupOutdatedCaches(),
        e.registerRoute(
            '/',
            new e.NetworkFirst({
                cacheName: 'start-url',
                plugins: [
                    {
                        cacheWillUpdate: async ({ request: e, response: n, event: i, state: s }) =>
                            n && 'opaqueredirect' === n.type
                                ? new Response(n.body, { status: 200, statusText: 'OK', headers: n.headers })
                                : n,
                    },
                ],
            }),
            'GET',
        ),
        e.registerRoute(
            /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            new e.CacheFirst({
                cacheName: 'google-fonts',
                plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'static-font-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'static-image-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\/_next\/image\?url=.+$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'next-image',
                plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:mp3|mp4)$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'static-media-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:js)$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'static-js-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:css|less)$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'static-style-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            /\/_next\/data\/.+\/.+\.json$/i,
            new e.StaleWhileRevalidate({
                cacheName: 'next-data',
                plugins: [
                    {
                        handlerDidError: async ({ request: e, event: n, error: i, state: s }) =>
                            new Response(
                                JSON.stringify({
                                    pageProps: {
                                        mdxSource: {
                                            compiledSource: 'function MDXContent(){}',
                                            renderedOutput: '<p>Oops! Looks like there is no internet connection.</p>',
                                        },
                                        frontMatter: {
                                            slug: 'no-internet-connection',
                                            title: 'Oops! No Internet Connection',
                                            published: !0,
                                            publishedAt: new Date().toISOString().substring(0, 10),
                                        },
                                    },
                                }),
                                { status: 200 },
                            ),
                    },
                    new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 }),
                ],
            }),
            'GET',
        ),
        e.registerRoute(
            /\.(?:json|xml|csv)$/i,
            new e.NetworkFirst({
                cacheName: 'static-data-assets',
                plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            ({ url: e }) => {
                if (!(self.origin === e.origin)) return !1
                const n = e.pathname
                return !n.startsWith('/api/auth/') && !!n.startsWith('/api/')
            },
            new e.NetworkFirst({
                cacheName: 'apis',
                networkTimeoutSeconds: 10,
                plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        ),
        e.registerRoute(
            ({ url: e }) => {
                if (!(self.origin === e.origin)) return !1
                return !e.pathname.startsWith('/api/')
            },
            new e.NetworkFirst({
                cacheName: 'others',
                networkTimeoutSeconds: 10,
                plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400, purgeOnQuotaError: !0 })],
            }),
            'GET',
        )
})
