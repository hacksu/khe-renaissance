<script lang="ts">
    import Hacksu from "../assets/hacksu.svg";
    import Mlh from "../assets/mlh.svg";
    import Devpost from "../assets/devPost.png";
</script>

<footer class="site-footer site-container">
    <div class="footer-marks">
        <a href="https://hacksu.com" target="_blank" rel="noopener noreferrer"><img src={Hacksu} alt="HacKSU" /></a>
        <a href="https://mlh.io" target="_blank" rel="noopener noreferrer"><img src={Mlh} alt="Major League Hacking" /></a>
        <a href="https://khe-2027.devpost.com/" target="_blank" rel="noopener noreferrer"><img class="devpost" src={Devpost} alt="Devpost" /></a>
    </div>
    <p>Kent Hack Enough 2027 / Organized by HacKSU.</p>
    <div class="footer-links">
        <a href="https://mlh.io/code-of-conduct" target="_blank" rel="noopener noreferrer">Code of conduct</a>
        <a href="#top">Back to top</a>
    </div>
</footer>

<style>
    .site-footer { display: flex; align-items: center; justify-content: space-between; gap: 25px; padding: 30px 0; color: #9cabbc; font-size: 12px; line-height: 1.6; }
    .footer-marks { display: flex; align-items: center; gap: 20px; }
    .footer-marks img { display: block; width: 65px; max-height: 24px; object-fit: contain; filter: grayscale(1) brightness(0) invert(.8); }
    .footer-marks .devpost { width: 22px; filter: grayscale(1); }
    p { margin: 0; }
    .footer-links { display: flex; gap: 23px; }
    a { color: inherit; text-decoration: none; }
    a:hover { color: #fff; text-decoration: underline; }
    @media (max-width: 900px) { .site-footer { flex-wrap: wrap; } }
    @media (max-width: 760px) {
        .site-footer { gap: 22px; padding: 26px 0; }
        .footer-marks { gap: 17px; }
        .footer-marks img { width: 54px; max-height: 21px; }
        .footer-links { width: 100%; gap: 25px; }
    }
</style>
