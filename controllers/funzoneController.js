export const getFunActivities = (req, res) => {
  const funData = [
    { title: "Truth or Dare", desc: "Play with your partner or friends" },
    { title: "Virtual Quiz", desc: "Check your compatibility with others" },
    { title: "Mini Games", desc: "Enjoy fun activities together" },
    { title: "Spin the Wheel", desc: "Win exciting rewards" },
  ];
  res.json(funData);
};
