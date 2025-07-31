# Set environment variables
$env:RAZORPAY_KEY_ID="rzp_test_qnrr4eJ9O4Qys"
$env:RAZORPAY_KEY_SECRET="OEjkhPYGk5c4MQZ2PpAJh7Tz"

# Run the function directly with deno
deno run --allow-net --allow-env --allow-read --allow-write --unstable index.ts
