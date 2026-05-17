let latestData = [];

exports.handler = async (event) => {

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(latestData)
    };
  }

  if (event.httpMethod === "POST") {
    try {

      const data = JSON.parse(event.body);

      latestData = data.value || data;

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: true,
          records: latestData.length
        })
      };

    } catch (err) {

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: err.message
        })
      };

    }
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed"
  };

};