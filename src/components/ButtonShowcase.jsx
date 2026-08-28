import './styles/button-showcase.css'

function ButtonShowcase() {
  return (
    <div className="button-showcase">
      <h2>Button Styles</h2>

      <section className="showcase-section">
        <h3>Solid Buttons</h3>
        <div className="buttons-grid">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-support">Support Button</button>
          <button className="btn-success">Success Button</button>
          <button className="btn-danger">Danger Button</button>
          <button className="btn-info">Info Button</button>
        </div>
      </section>

      <section className="showcase-section">
        <h3>Button Sizes</h3>
        <div className="buttons-grid">
          <button className="btn-primary btn-sm">Small</button>
          <button className="btn-primary">Medium (Default)</button>
          <button className="btn-primary btn-lg">Large</button>
        </div>
      </section>

      <section className="showcase-section">
        <h3>Outline & Ghost</h3>
        <div className="buttons-grid">
          <button className="btn-outline">Outline Button</button>
          <button className="btn-ghost">Ghost Button</button>
        </div>
      </section>

      <section className="showcase-section">
        <h3>States</h3>
        <div className="buttons-grid">
          <button className="btn-primary">Normal</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
      </section>

      <section className="showcase-section full-width">
        <h3>Block Buttons</h3>
        <button className="btn-primary btn-block">Full Width Button</button>
      </section>
    </div>
  )
}

export default ButtonShowcase
