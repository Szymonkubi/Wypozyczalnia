<template>
  <div class="container mx-auto px-4">
    <h1 class="text-xl font-bold text-center my-8">
      Tesla Car Rental Reservation
    </h1>
    <form
      @submit.prevent="submitForm"
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
    >
      <div class="mb-4">
        <label
          for="pickup-location"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Pickup Location
        </label>
        <select
          v-model="form.pickupLocation"
          id="pickup-location"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Palma Airport">Palma Airport</option>
          <option value="Palma Center">Palma Center</option>
          <option value="Alcudia">Alcudia</option>
          <option value="Manacor">Manacor</option>
        </select>
      </div>

      <div class="mb-4">
        <label
          for="return-location"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Return Location
        </label>
        <select
          v-model="form.returnLocation"
          id="return-location"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Palma Airport">Palma Airport</option>
          <option value="Palma Center">Palma Center</option>
          <option value="Alcudia">Alcudia</option>
          <option value="Manacor">Manacor</option>
        </select>
      </div>

      <div class="mb-4">
        <label
          for="car-model"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Car Model
        </label>
        <select
          v-model="form.carModel"
          id="car-model"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Model S">Model S</option>
          <option value="Model 3">Model 3</option>
          <option value="Model X">Model X</option>
          <option value="Model Y">Model Y</option>
        </select>
      </div>

      <div class="mb-4">
        <label
          for="start-date"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          Start Date
        </label>
        <input
          v-model="form.startDate"
          type="date"
          :min="minDate"
          id="start-date"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div class="mb-4">
        <label
          for="end-date"
          class="block text-gray-700 text-sm font-bold mb-2"
        >
          End Date
        </label>
        <input
          v-model="form.endDate"
          type="date"
          :min="form.startDate || minDate"
          id="end-date"
          required
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div class="flex items-center justify-between">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Calculate and Reserve
        </button>
      </div>
    </form>
    <p v-if="isCarAvailable && totalCost">Total cost: {{ totalCost }}€</p>
    <p v-else-if="!isCarAvailable">Auto niedostępne w wybranych terminach.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        pickupLocation: "",
        returnLocation: "",
        carModel: "",
        startDate: "",
        endDate: "",
      },
      totalCost: null,
      minDate: new Date().toISOString().split("T")[0],
      isCarAvailable: true,
    };
  },
  methods: {
    calculateTotalCost(daysRented, carModel) {
      const rates = {
        "Model S": 100,
        "Model 3": 70,
        "Model X": 120,
        "Model Y": 80,
      };
      return daysRented * rates[carModel];
    },
    submitForm() {
      const startDate = new Date(this.form.startDate);
      const endDate = new Date(this.form.endDate);
      const timeDiff = endDate - startDate;
      const daysRented = Math.max(
        Math.ceil(timeDiff / (1000 * 60 * 60 * 24)),
        1
      );

      this.totalCost = this.calculateTotalCost(daysRented, this.form.carModel);

      const reservationData = {
        ...this.form,
        totalCost: this.totalCost,
      };

      fetch("http://localhost:3000/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carModel: this.form.carModel,
          startDate: this.form.startDate,
          endDate: this.form.endDate,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.isAvailable) {
            this.isCarAvailable = true;

            this.makeReservation(reservationData);
          } else {
            this.isCarAvailable = false;
            this.totalCost = null;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    makeReservation(reservationData) {
      fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Reservation successful:", data);
        })
        .catch((error) => {
          console.error("Error making reservation:", error);
        });
    },
  },
};
</script>

<style scoped></style>
