<script lang="ts">
  import { handleSignup } from "$lib/firebase/signUp.svelte";
  let email = $state("");
  let password = $state("");
</script>

<div class="relative flex flex-col justify-center h-screen overflow-hidden">
  <div
    class="w-full p-6 m-auto bg-base-200 rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg"
  >
    <h1 class="text-3xl font-semibold text-center text-primary">DaisyUI</h1>
    <form
      onsubmit={() => {
        handleSignup(email, password);
      }}
      class="space-y-4"
    >
      <div>
        <div class="text-base label-text">Email</div>
        <label class="w-full label">
          <input
            bind:value={email}
            type="text"
            placeholder="Email Address"
            class="w-full input input-bordered"
          />
        </label>
      </div>
      <div>
        <div class="text-base label-text">Password</div>
        <label class="label w-full">
          <input
            bind:value={password}
            type="password"
            placeholder="Enter Password"
            class="w-full input input-bordered"
          />
        </label>
      </div>
      <a
        href="/"
        class="text-xs text-gray-600 hover:underline hover:text-blue-600"
        >Forget Password?</a
      >
      <div>
        <button class="btn-neutral btn btn-block">Login</button>
      </div>
    </form>
  </div>
</div>
