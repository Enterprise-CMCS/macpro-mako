export const handler = async () => {
  const lambdaArnToCall = process.env.lambdaArnToCall;
  try {
    if (!lambdaArnToCall) {
      throw new Error("An error occured");
    }

    const html = `
      <div style="width: 100%; display: flex; justify-content: center;">
        <a class="btn btn-primary">Get Dashboard Template</a>
      </div>
      <cwdb-action action="call" endpoint="${lambdaArnToCall}" display="popup">
       {}
      </cwdb-action>
      `;

    return html;
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "An error occured",
      }),
    };
  }
};
