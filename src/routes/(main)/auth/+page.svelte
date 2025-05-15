<script lang="ts">
  import { auth } from "$lib/firebase/firebaseConfig";
  import SignIn from "./SignIn.svelte";
  import SignUp from "./SignUp.svelte";
  import { signOut } from "firebase/auth";
</script>

<SignIn />
<SignUp />
<button
  class="btn btn-primary"
  onclick={async () => {
    await signOut(auth);
    // Logout successful
    console.log("User signed out successfully.");
  }}>Log Out</button
>
