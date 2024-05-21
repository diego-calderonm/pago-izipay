import { useState } from 'react';
import KRGlue from '@lyracom/embedded-form-glue';
import axios from 'axios';
import PaymentForm from './components/PaymentForm';

function App() {
  const [isShow, setIsShow] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const publicKey = '44749292:testpublickey_apD4sxLwpcp7c4bDLabbYwPLpRyI5CwAhsDKtCUQu1v9O';
  const endPoint = 'https://api.micuentaweb.pe';
  const server = "http://localhost:3003";

  const payment = () => {
    const ExpRegSoloNumeros = "^[0-9]+$";
    if (amount.match(ExpRegSoloNumeros) != null) {
      getFormToken(amount, publicKey, endPoint);
      setIsShow(true);
    } else {
      setIsValid(false);
      setTimeout(() => setIsValid(true), 3000);
    }
  }

  const getFormToken = (monto, publicKey, domain) => {
    const dataPayment = {
      amount: monto * 100,
      currency: "PEN",
      customer: {
        email: "example@gmail.com"
      },
      orderId: "pedido-0"
    };

    axios.post(`${server}/api/createPayment`, dataPayment)
      .then(({ data }) => {
        if (!data.formToken) {
          throw new Error("Form Token no recibido");
        }
        console.log("Form Token recibido:", data.formToken);

        return KRGlue.loadLibrary(domain, publicKey)
          .then(({ KR }) => KR.setFormConfig({
            formToken: data.formToken,
          }))
          .then(({ KR }) => KR.onSubmit(validatePayment))
          .then(({ KR }) => KR.attachForm("#form"))
          .then(({ KR, result }) => KR.showForm(result.formId));
      })
      .catch(err => {
        console.error("Error en el proceso de obtención del formToken o en el proceso de carga del formulario:", err);
        setError(err.message || "Error desconocido");
      });
  };

  const validatePayment = (resp) => {
    axios.post(`${server}/validatePayment`, resp)
      .then(({ data }) => {
        if (data === "Valid Payment") {
          setIsShow(false);
          alert("Pago Satisfactorio");
        } else {
          alert("Pago Inválido");
        }
      })
      .catch(err => {
        console.error("Error en la validación del pago:", err);
        alert("Error en la validación del pago");
      });
    return false;
  }

  return (
    <div className='container'>
      <main>
        <div className="py-5 text-center">
          <h3>Ejemplo de un formulario incrustado con React</h3>
          <div className="alert alert-danger align-items-center" role="alert" style={{ display: error !== "" ? "flex" : "none" }}>
            <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlinkHref="#exclamation-triangle-fill"/></svg>
            <div>{error}</div>
          </div>
        </div>

        <div className="row g-5">
          <div className="col-md-5 col-lg-4 order-md-last">
            <div className="d-flex justify-content-center">
              <h4>
                <span className="text-primary">Formulario Popin</span>
              </h4>
            </div>
            <hr className="my-4" />
            <div className="d-flex justify-content-center">
              <div id="myDIV" className="formulario" style={{ display: isShow ? "block" : "none" }}>
                <div id="form">
                  <PaymentForm />
                </div>
              </div>
            </div>
            <hr className="my-4" />
          </div>

          <div className="col-md-7 col-lg-8">
            <form className="needs-validation">
              <div className="row g-3">
                <div className="col-sm-6">
                  <label htmlFor="firstName" className="form-label">Monto Total</label>
                  <input type="text" className="form-control" onChange={e => setAmount(e.target.value)} value={amount} placeholder="S/." required />
                  <div className="invalid-feedback" style={{ display: isValid ? "none" : "block" }}>Ingrese un monto válido.</div>
                </div>

                <div className="col-sm-6">
                  <label htmlFor="lastName" className="form-label">Moneda</label>
                  <input type="text" className="form-control" id="lastName" value="PEN" readOnly />
                </div>
              </div>

              <hr className="my-4" />

              <button onClick={payment} className="w-100 btn btn-primary btn-lg" type="button">Finalizar con el Pago</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
