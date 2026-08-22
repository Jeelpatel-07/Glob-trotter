import './Loader.css';

export default function Loader({ size = 'md', text, fullPage = false }) {
  if (fullPage) {
    return (
      <div className="loader-fullpage">
        <div className={`loader-spinner loader-${size}`} />
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loader-inline">
      <div className={`loader-spinner loader-${size}`} />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
