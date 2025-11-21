const initializeDb = require("./db/db.connect");
//different models
const Comment = require("./models/model.comment");
const Lead = require("./models/model.Lead");
const SalesAgent = require("./models/model.SalesAgent");
const Tag = require("./models/model.tag");
const mongoose = require("mongoose");
//express importing
const express = require("express");
const app = express();
app.use(express.json());

//cors code with origin "*".So it can be accesible by anyone
const cors = require("cors");

app.use(cors({ origin: "*", credentials: true }));

//apis for sales agent
//1--add new sales agent
const addNewSalesAgent = async (salesAgent_data) => {
  try {
    const newAgentData = new SalesAgent(salesAgent_data);
    const saved_newAgentData = await newAgentData.save();
    return saved_newAgentData;
  } catch (error) {
    throw error;
  }
};
app.post("/addSalesAgent", async (req, res) => {
  try {
    const newAgent = await addNewSalesAgent(req.body);
    if (newAgent) {
      res.status(201).json({
        message: "New Agent data Created successfully.",
      });
    } else {
      res.status(400).json({
        message: "Invalid input.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while saving new sales agent",
      error: error.message,
    });
  }
});

//2- Get Sales agent data
const findallSalesAgent = async () => {
  try {
    const allSalesAgent = await SalesAgent.find();
    return allSalesAgent;
  } catch (error) {
    throw error;
  }
};
app.get("/getAllSalesAgents", async (req, res) => {
  try {
    const allSalesAgents = await findallSalesAgent();
    if (allSalesAgents.length > 0) {
      res.status(200).json({ data: allSalesAgents });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while fetching sales agents",
      error: error.message,
    });
  }
});
//apis for Lead
//1-add lead
const addNewLead = async (newLead_data) => {
  try {
    const newLead = new Lead(newLead_data);
    const saved_newLead_data = await newLead.save();
    return saved_newLead_data;
  } catch (error) {
    throw error;
  }
};
app.post("/addNewLead", async (req, res) => {
  try {
    const newLead = await addNewLead(req.body);
    if (newLead) {
      res.status(201).json({ message: "New lead data added successfully" });
    } else {
      res
        .status(400)
        .json({ message: "There are some missing fields in input" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error occurred while fetching adding new lead",
      error: error.message,
    });
  }
});
//2- api to get all lead data
const findAllLeads = async (filterObj, sorting) => {
  try {
    const allLeads = await Lead.find(filterObj).sort(sorting);
    return allLeads;
  } catch (error) {
    throw error;
  }
};
app.get("/getAllLeads", async (req, res) => {
  try {
    const { salesAgent, status, tags, source, sortByAsc } = req.query;
    const filterObj = {};
    if (salesAgent) {
      filterObj.salesAgent = new mongoose.Types.ObjectId(salesAgent);
    }

    if (status) filterObj.status = status;
    if (source) filterObj.source = source;

    if (tags) {
      const tagsArray = tags.split(",");
      filterObj.tags = { $in: tagsArray };
    }

    const sortOrder = sortByAsc === "false" ? -1 : 1;
    const allLeads = await findAllLeads(filterObj, { createdAt: sortOrder });
    if (allLeads.length > 0) {
      res.status(200).json({
        data: allLeads,
      });
    } else {
      res.status(200).json({
        message: "Currently there are no leads",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching all lead data",
      error: error.message,
    });
  }
});

//3--api to get lead data by id
app.get(`/getLeadData/:lead_id`, async (req, res) => {
  try {
    const { lead_id } = req.params;
    const lead_data = await Lead.findById(lead_id).populate("salesAgent");
    if (lead_data) {
      res.status(200).json({ data: lead_data });
    } else {
      res.status(404).json({ message: `data is not found` });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error while fetching lead data`,
      error: error.message,
    });
  }
});
//--api for update lead by id
app.post(`/updateLeadData/:lead_id`, async (req, res) => {
  try {
    const { lead_id } = req.params;
    const updates_lead_data = await Lead.findByIdAndUpdate(lead_id, req.body, {
      new: true,
    });
    if (updates_lead_data) {
      res
        .status(200)
        .json({ data: updates_lead_data, message: "update data successfully" });
    } else {
      res.status(404).json({ message: `data is not found` });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error while updating lead data`,
      error: error.message,
    });
  }
});
//apis for comments
app.get("/comments", async (req, res) => {
  try {
    const comment_list = await Comment.find();
    if (comment_list.length > 0) {
      res.status(200).json({ data: comment_list });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while fetching comments",
      error: error.message,
    });
  }
});
app.post("/addComments", async (req, res) => {
  try {
    const newComments = new Comment(req.body);
    const savedComments = await newComments.save();
    if (savedComments) {
      res.status(201).json({ message: "Comment saved successfully" });
    } else {
      res.status(400).json({ message: "Missing firld in comment" });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while adding comments",
      error: error.message,
    });
  }
});
//apis for tags
app.get("/tags", async (req, res) => {
  try {
    const tag_list = await Tag.find();
    if (tag_list.length > 0) {
      res.status(200).json({ data: tag_list });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while fetching tags.",
      error: error.message,
    });
  }
});

const PORT = 3000;

const startserver = async () => {
  await initializeDb();
  app.listen(PORT, () => console.log("Server is connected with port ", PORT));
};
startserver();
