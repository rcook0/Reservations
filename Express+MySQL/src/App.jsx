import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [airlines, setAirlines] = useState([]);
  const [flights, setFlights] = useState([]);
  const [reservation, setReservation] = useState({ passenger_id: "", departure_date: "", airline_code: "", flight_number: "", seat_number: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/api/airlines").then(res => setAirlines(res.data));
    axios.get("http://localhost:3000/api/flights").then(res => setFlights(res.data));
  }, []);

  const bookSeat = async () => {
    try {
      await axios.post("http://localhost:3000/api/reservations", reservation);
      setMessage("Reservation confirmed ✅");
    } catch (err) {
      setMessage(err.response?.data || "Error booking seat ❌");
    }
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl mb-4">✈️ Airline Reservation System</h1>

      <h2 className="text-xl">Airlines</h2>
      <ul className="list-disc ml-6 mb-4">
        {airlines.map(a => <li key={a.code}>{a.code} - {a.name}</li>)}
      </ul>

      <h2 className="text-xl">Flights</h2>
      <ul className="list-disc ml-6 mb-4">
        {flights.map(f => (
          <li key={f.flight_number}>
            {f.airline_code}{f.flight_number} {f.departure_airport} → {f.arrival_airport} ({f.aircraft})
          </li>
        ))}
      </ul>

      <h2 className="text-xl">Book Seat</h2>
      <div className="space-y-2">
        <input className="border p-1" placeholder="Passenger ID" onChange={e => setReservation({ ...reservation, passenger_id: e.target.value })} />
        <input className="border p-1" placeholder="Departure Date YYYY-MM-DD" onChange={e => setReservation({ ...reservation, departure_date: e.target.value })} />
        <input className="border p-1" placeholder="Airline Code" onChange={e => setReservation({ ...reservation, airline_code: e.target.value })} />
        <input className="border p-1" placeholder="Flight Number" onChange={e => setReservation({ ...reservation, flight_number: e.target.value })} />
        <input className="border p-1" placeholder="Seat Number" onChange={e => setReservation({ ...reservation, seat_number: e.target.value })} />
        <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={bookSeat}>Book</button>
      </div>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

export default App;
