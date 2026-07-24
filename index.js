const initializeDb = require("./db/db.connect");
//different models
const Comment = require("./models/model.comment");
const Lead = require("./models/model.Lead");
const SalesAgent = require("./models/model.SalesAgent");
const Tag = require("./models/model.tag");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

//express importing
const express = require("express");
const app = express();
app.set("trust proxy", 1);
app.disable("etag");

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

app.use(cookieParser());
app.use(express.json());

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://avanya-frontend.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);

//public routes
app.use("/auth", require("./routers/authRoutes"));

//auth middilewire
const auth = require("./middilewire/auth");
app.use(auth);
//protected routes
app.use("/auth", require("./routers/userRoutes"));
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
//api for delete sales agent by id
app.delete("/deletesalesAgent/:salesAgent_id", async (req, res) => {
  try {
    const { salesAgent_id } = req.params;
    const deleted_data = await SalesAgent.findByIdAndDelete(salesAgent_id);
    if (deleted_data) {
      res.status(200).json({ message: "deleted data successfully" });
    } else {
      res.status(404).json({ message: `data is not found` });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error while deleting data lead data`,
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
    const { salesAgent, status, tags, source, sortByAsc, priority } = req.query;
    const filterObj = {};
    if (salesAgent) {
      filterObj.salesAgent = new mongoose.Types.ObjectId(salesAgent);
    }

    if (status) filterObj.status = status;
    if (source) filterObj.source = source;
    if (priority) filterObj.priority = priority;

    if (tags) {
      const tagsArray = tags.split(",");
      filterObj.tags = { $in: tagsArray };
    }
    const sortOrder = sortByAsc === "true" ? 1 : -1;
    const allLeads = await findAllLeads(filterObj, { timeToClose: sortOrder });
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
//api for delete lead by id
app.delete("/deleteLead/:lead_id", async (req, res) => {
  try {
    const { lead_id } = req.params;
    const deleted_data = await Lead.findByIdAndDelete(lead_id);
    await Comment.deleteMany({ lead: new mongoose.Types.ObjectId(lead_id) });
    if (deleted_data) {
      res.status(200).json({ message: "deleted data successfully" });
    } else {
      res.status(404).json({ message: `data is not found` });
    }
  } catch (error) {
    res.status(500).json({
      message: `Error while deleting lead data`,
      error: error.message,
    });
  }
});
//apis for comments
app.get("/leads/:id/comments", async (req, res) => {
  try {
    const comment_list = await Comment.find({ lead: req.params.id }).populate({
      path: "author",
      select: "name",
    });

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
      res.status(400).json({ message: "Missing feild in comment" });
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
//apis for report
const sevenDaysAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const getReportOfLastWeek = async () => {
  try {
    const report = await Lead.find({
      status: "Closed",
      updatedAt: { $gte: sevenDaysAgoDate },
    })
      .select("name updatedAt salesAgent")
      .populate("salesAgent");
    return report;
  } catch (error) {
    throw error;
  }
};
app.get("/report/last-week", async (req, res) => {
  try {
    const report = await getReportOfLastWeek();
    if (report.length > 0) {
      res.status(200).json({ data: report });
    } else {
      res
        .status(200)
        .json({ data: [], message: "Currently there are no daya" });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while fetching reports.",
      error: error.message,
    });
  }
});

const getReportPipeline = async () => {
  try {
    const report = await Lead.countDocuments({ status: { $ne: "Closed" } });
    return report;
    // return report.length;
  } catch (error) {
    throw error;
  }
};

app.get("/report/pipeline", async (req, res) => {
  try {
    const report = await getReportPipeline();
    if (report > 0) {
      res.status(200).json({ totalLeadsInpieline: report });
    } else {
      res.status(200).json({ totalLeadsInpieline: 0 });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while fetching reports.",
      error: error.message,
    });
  }
});

const reportClosedByAgent = async (agentId) => {
  try {
    const report = await Lead.find({
      salesAgent: agentId,
      status: "Closed",
    })
      .select("name updatedAt salesAgent")
      .populate("salesAgent");
    return report;
  } catch (error) {
    throw error;
  }
};

app.get("/report/closed-by-agent/:id", async (req, res) => {
  try {
    const report = await reportClosedByAgent(req.params.id);
    if (report.length > 0) {
      res.status(200).json({ data: report });
    } else {
      res
        .status(200)
        .json({ data: [], message: "The sales agent have no closed leads" });
    }
  } catch (error) {
    res.status(500).json({
      message: "error occurred while fetching reports.",
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
