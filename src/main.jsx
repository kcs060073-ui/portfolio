import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const strengths = [
  {
    num: '01',
    title: '用户理解能力',
    desc: '能够从用户需求、场景和内容反馈中提炼问题，判断用户真正关注什么，并转化为选题、活动和运营动作。',
    tags: ['用户洞察', '需求拆解', '场景判断'],
    className: 'strengthCard strengthLarge',
  },
  {
    num: '02',
    title: '内容策划能力',
    desc: '具备图文、短视频、PPT与视觉物料的综合策划经验，能够完成从选题、脚本、拍摄到最终呈现的内容生产。',
    tags: ['选题策划', '文案表达', '拍摄剪辑'],
    className: 'strengthCard strengthWide',
  },
  {
    num: '03',
    title: '项目执行能力',
    desc: '习惯围绕目标拆解任务，推进时间节点、内容产出和现场执行，保证方案从想法进入真实场景。',
    tags: ['活动执行', '流程推进', '团队协作'],
    className: 'strengthCard',
  },
  {
    num: '04',
    title: '数据复盘能力',
    desc: '具备基础数据分析意识，能够通过播放量、互动量、转化率和流程效率判断效果，并根据反馈持续优化。',
    tags: ['数据看板', '效果评估', '复盘优化'],
    className: 'strengthCard',
  },
  {
    num: '05',
    title: 'AI 与工具应用能力',
    desc: '持续探索 AI 工具、Codex 与内容生产流程，能够用工具辅助完成资料整理、文案优化、视觉生成和项目搭建。',
    tags: ['AI辅助', 'Codex', '效率工具'],
    className: 'strengthCard strengthWide',
  },
]
const projects = [
  ['01 主要项目', '品牌故事策划', '围绕品牌调性、用户洞察与内容节奏，建立从选题到视觉表达的完整传播方案。', 'imageOne', 'projectCard featuredProject'],
  ['02 校园实践', '校园增长项目', '将校园场景转化为可传播内容，用年轻化语言完成项目曝光与互动。', 'imageTwo', 'projectCard'],
  ['03 影像手记', '创作者视觉手记', '以摄影和短视频记录真实人物与生活现场。', 'imageThree', 'projectCard'],
];

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.14 });
    document.querySelectorAll('.reveal').forEach((item) => observer.observe(item));

    const floatingNav = document.querySelector('.portfolioNav');
    const secondScreen = document.querySelector('#about');
    const updateFloatingNav = () => {
      if (!floatingNav || !secondScreen) return;
      const threshold = secondScreen.getBoundingClientRect().top + window.scrollY - 96;
      floatingNav.classList.toggle('is-floating', window.scrollY >= threshold);
    };
    updateFloatingNav();
    window.addEventListener('scroll', updateFloatingNav, { passive: true });
    window.addEventListener('resize', updateFloatingNav);
    const previewVideos = document.querySelectorAll('.projectPreviewVideo');
    previewVideos.forEach((video) => {
      const setPreviewFrame = () => {
        const target = Number(video.dataset.previewTime || 6);
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = Math.min(target, Math.max(video.duration - 0.2, 0));
        }
      };
      video.addEventListener('loadedmetadata', setPreviewFrame, { once: true });
      video.addEventListener('seeked', () => video.pause(), { once: true });
    });

    const videoModal = document.querySelector('#videoModal');
    const videoPlayer = document.querySelector('#caseVideoPlayer');
    const videoTitle = document.querySelector('#videoModalTitle');
    const openVideoButtons = document.querySelectorAll('.js-open-video');
    const closeVideoButtons = document.querySelectorAll('[data-video-close]');

    const closeVideoModal = () => {
      if (!videoModal || !videoPlayer) return;
      videoPlayer.pause();
      videoModal.classList.remove('is-open');
      videoModal.setAttribute('aria-hidden', 'true');
    };

    openVideoButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const src = button.dataset.videoSrc;
        if (!src || !videoModal || !videoPlayer) return;
        event.preventDefault();
        if (videoTitle && button.dataset.videoTitle) videoTitle.textContent = button.dataset.videoTitle;
        if (videoPlayer.getAttribute('src') !== src) videoPlayer.setAttribute('src', src);
        videoModal.classList.add('is-open');
        videoModal.setAttribute('aria-hidden', 'false');
        videoPlayer.currentTime = 0;
        videoPlayer.play().catch(() => {});
      });
    });

    closeVideoButtons.forEach((button) => button.addEventListener('click', closeVideoModal));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeVideoModal();
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateFloatingNav);
      window.removeEventListener('resize', updateFloatingNav);
    };
  }, []);

  return (
    <main className="siteShell">
      <section className="hero portfolioHero sectionPanel" id="home">
        <img className="portfolioHeroImage" src="assets/hero-abstract.png" alt="抽象彩色首页背景" />
        <div className="portfolioHeroShade" aria-hidden="true" />
        <nav className="portfolioNav"><a className="portfolioBrand" href="#home">史铠畅</a><div className="portfolioNavLinks"><a href="#about">个人简介</a><a href="#strengths">个人优势</a><a href="#timeline">核心项目</a><a href="#works">延展实践</a></div><a className="portfolioContact" href="#contact">联系我</a></nav>
        <div className="container portfolioHeroContent"><div className="heroBadge">运营与内容策划作品集 / Portfolio Vol.01</div><h1><span className="titleLine">从用户出发，</span><span className="titleLine">把内容做成结果。</span></h1><h2>内容运营｜用户运营｜品牌策划｜影像创作</h2><p>整理我在校园新媒体、品牌策划、活动运营与影像创作中的实践经历，<br />关注从用户洞察、内容策划到项目执行与复盘的完整过程。</p><div className="heroActions magazineActions"><a className="heroPrimary" href="#timeline">查看项目</a><a className="heroSecondary" href="assets/shi-kaichang-resume.pdf">下载简历</a></div><div className="heroStats heroTags" aria-label="个人能力标签"><span>用户洞察</span><span>内容策划</span><span>活动执行</span><span>数据复盘</span></div></div>
      </section>
      <section className="about resumeSection aboutMagazine reveal" id="about"><div className="container resumeInner"><div className="resumeHeading"><h2>关于我</h2><span>ABOUT ME</span></div><div className="resumeMain"><figure className="resumePortrait" aria-label="史铠畅演讲照片" /><div className="resumeProfile"><p className="resumeKicker">运营与内容策划 / USER · CONTENT · PROJECT</p><h3>你好，我是史铠畅。</h3><p className="resumePosition">一名关注用户、内容与项目落地的工商管理学生。</p><p className="resumeIntro">目前就读于天津理工大学工商管理专业。过去三年，我持续参与校园新媒体运营、活动策划、品牌创意项目与影像内容制作，逐渐形成了从用户洞察、内容策划、项目执行到数据复盘的完整实践意识。</p><div className="resumeNumbers aboutProjectData"><div><strong>8万+</strong><span>参与账号累计播放</span></div><div><strong>600+</strong><span>参与推文内容沉淀</span></div><div><strong>163%</strong><span>账号矩阵粉丝增长</span></div></div></div></div><div className="resumeCards aboutExperienceCards"><a href="#timeline"><span>用户洞察 / 内容矩阵</span><h4>校园新媒体负责人</h4><p>负责学院新媒体内容 IP、推文与短视频生产，沉淀标准化运营流程。</p></a><a href="#timeline"><span>品牌创意 / 策划输出</span><h4>品牌策划项目</h4><p>围绕年轻用户和社交场景，输出品牌年轻化创意方案与内容矩阵。</p></a><a href="#timeline"><span>用户分层 / 数据复盘</span><h4>用户增长运营实习</h4><p>参与用户分层、业务看板和活动增长，关注运营动作的结果反馈。</p></a></div></div></section>
      <section className="capabilities sectionPanel strengthsMagazine reveal" id="strengths"><div className="container strengthsInner"><div className="strengthsHeader"><div><h2>CORE STRENGTHS</h2><span>个人优势</span></div><p>围绕用户、内容、执行与复盘形成的运营能力。</p></div><div className="strengthsGrid">{strengths.map(({ num, title, desc, tags, className }) => <article className={className} key={title}><div className="strengthTop"><b>{num}</b><h3>{title}<span>.</span></h3></div><p className="strengthDesc">{desc}</p><div className="strengthTags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}</div></div></section>
      <section className="projectsCore sectionPanel reveal" id="timeline"><div className="container projectEditorialInner"><div className="projectSectionHeader"><div><h2>CORE PROJECTS</h2><span>核心项目</span></div><div className="projectLead"><p className="projectSub">更贴近运营、内容策划与品牌传播方向的代表性实践。</p><p>这部分选择了最能代表我求职方向的三个项目：品牌策划、短视频广告与校园新媒体运营。它们共同指向我对用户洞察、内容表达、项目执行和传播复盘的理解。</p></div></div><div className="coreProjectGrid"><article className="projectFeatureCard"><div className="projectCover projectCoverHbn"><span>HBN</span><i>慢慢发光</i></div><div className="projectBody"><div className="projectMeta">01 / 2025</div><h3>HBN 原白屋品牌整合营销策划</h3><p className="projectType">品牌策划 / 活动创意 / 内容传播</p><p className="projectText">围绕“慢慢发光，不必赶场”的核心概念，提出线下快闪体验与社交传播结合的整合营销方案，尝试用场景化体验降低护肤焦虑，建立年轻消费者对品牌的长期心智。</p><div className="projectTags"><span>用户洞察</span><span>品牌策划</span><span>快闪活动</span><span>社交传播</span></div><a className="projectButton" href="hbn-case.html">查看项目详情</a></div></article><article className="projectFeatureCard"><div className="projectCover projectCoverVideo js-open-video" data-video-src="assets/projects/wangchao-hichajiu-video.mp4" data-video-title="当 MBTI 遇见 DDL：王朝嗨茶酒短视频广告"><video className="projectPreviewVideo" src="assets/projects/wangchao-hichajiu-video.mp4" muted playsInline preload="metadata" data-preview-time="7.2" /><span>MBTI × DDL</span><i>茶酒融合，释放真我</i></div><div className="projectBody"><div className="projectMeta">02 / 2026.01 - 2026.04</div><h3>当 MBTI 遇见 DDL：王朝嗨茶酒短视频广告</h3><p className="projectType">短视频策划 / 分镜脚本 / 品牌植入</p><p className="projectText">以“办公室 DDL 压力场景”为切入点，将 MBTI 人格设定与茶酒产品体验结合，完成一支 60 秒短视频广告的分镜策划，通过角色对话、产品特写与场景转折突出“茶酒融合，释放真我”的传播表达。</p><div className="projectTags"><span>视频脚本</span><span>产品植入</span><span>场景营销</span><span>拍摄执行</span></div><a className="projectButton js-open-video" href="assets/projects/wangchao-hichajiu-video.mp4" data-video-src="assets/projects/wangchao-hichajiu-video.mp4" data-video-title="当 MBTI 遇见 DDL：王朝嗨茶酒短视频广告">查看项目详情</a></div></article><article className="projectFeatureCard"><div className="projectCover projectCoverCampus"><div className="mediaCoverText"><span>NEW MEDIA</span><em>记录现场</em><i>放大影响</i></div><div className="mediaCoverMatrix" aria-hidden="true"><img src="assets/projects/new-media-case/nm-wechat-01.jpg" alt="" /><img src="assets/projects/new-media-case/nm-video-01.jpg" alt="" /><img src="assets/projects/new-media-case/nm-design-01.jpg" alt="" /></div></div><div className="projectBody"><div className="projectMeta">03 / 2023.09 - 2026.05</div><h3>校园新媒体内容运营实践</h3><p className="projectType">账号运营 / 内容策划 / 活动传播</p><p className="projectText">参与学院新媒体内容运营与活动传播，从选题策划、拍摄记录、推文制作到视频号内容发布，积累了校园场景下的内容生产、视觉表达和传播复盘经验。</p><div className="projectTags"><span>新媒体运营</span><span>活动传播</span><span>图文排版</span><span>视频号内容</span></div><a className="projectButton" href="new-media-case.html">查看项目详情</a></div></article></div></div></section>
      <section className="extendedPractice sectionPanel reveal" id="works"><div className="container projectEditorialInner"><div className="projectSectionHeader compact"><div><h2>EXTENDED PRACTICE</h2><span>延展实践</span></div><div className="projectLead"><p className="projectSub">从商业策划、创意比赛到 AI 实验与影像记录，持续拓展内容表达和项目执行能力。</p><p>这一部分收录了我的跨领域项目实践，包括大创项目、品牌营销策划、AI 视频实验和摄影作品。它们不作为求职主线，但共同补充了我的商业分析、创意表达、工具应用与视觉生产能力。</p></div></div><div className="extendedProjectGrid"><article className="projectSmallCard"><div className="projectMiniCover coverYongqing">乡土文化 × 商业计划</div><div className="projectBody"><div className="projectMeta">04 / 2025</div><h3>戏筑永清：文化赋能乡村振兴项目</h3><p className="projectType">大创项目 / 文旅策划 / 商业计划</p><p className="projectText">以河北永清地方戏曲文化资源为核心，围绕“文化赋能下的协同产业发展与乡村振兴”展开项目策划，尝试将地方文化资源转化为可持续的文旅与产业发展方案。</p><div className="projectTags"><span>项目调研</span><span>文旅策划</span><span>乡村振兴</span><span>商业计划</span></div><a className="projectButton" href="./xizhu-yongqing-case.html" data-direct-href="xizhu-yongqing-case.html">查看项目详情</a></div></article><article className="projectSmallCard"><div className="projectMiniCover coverChiwei">赤尾 × 华尔兹</div><div className="projectBody"><div className="projectMeta">05 / 2025</div><h3>滑尔兹协奏曲：赤尾品牌营销策划案</h3><p className="projectType">大广赛 / 品牌传播 / 创意策划</p><p className="projectText">以“华尔兹”作为创意隐喻，将产品体验卖点转化为浪漫化的品牌表达。方案包含市场分析、消费者洞察、营销策划、创意设计与媒介排期。</p><div className="projectTags"><span>市场分析</span><span>消费洞察</span><span>创意主题</span><span>媒介排期</span></div><a className="projectButton" href="./chiwei-case.html" data-direct-href="chiwei-case.html">查看项目详情</a></div></article><article className="projectSmallCard"><div className="projectMiniCover coverAi">AI VIDEO LAB</div><div className="projectBody"><div className="projectMeta">06 / 2025</div><h3>AI 生成综艺视频实验</h3><p className="projectType">AI 视频 / Prompt 设计 / 内容创意</p><p className="projectText">围绕综艺预告片场景，使用 AI 工具进行世界观设定、镜头提示词设计、画面生成与剪辑整合，探索 AI 在短视频创意、视觉预演和内容生产流程中的辅助价值。</p><div className="projectTags"><span>AI生成</span><span>Prompt设计</span><span>视频创意</span><span>剪辑整合</span></div><a className="projectButton" href="#contact">查看项目详情</a></div></article><article className="projectSmallCard"><div className="projectMiniCover coverPhoto">PHOTO ARCHIVE</div><div className="projectBody"><div className="projectMeta">07 / 2024 - 2026</div><h3>影像记录精选</h3><p className="projectType">摄影作品 / 活动记录 / 人物拍摄</p><p className="projectText">整理校园活动、毕业照、人像与日常纪实等影像作品，展示从拍摄策划、现场调度到后期处理的视觉表达能力，为内容运营与活动传播提供素材生产能力。</p><div className="projectTags"><span>人像摄影</span><span>活动记录</span><span>毕业照</span><span>视觉表达</span></div><a className="projectButton" href="visual-storytelling-case.html">查看项目详情</a></div></article></div></div></section>
      <div className="videoModal" id="videoModal" aria-hidden="true"><div className="videoModalBackdrop" data-video-close="true" /><div className="videoModalPanel" role="dialog" aria-modal="true" aria-label="项目视频播放器"><button className="videoModalClose" type="button" data-video-close="true">关闭</button><div className="videoModalHeader"><span>VIDEO CASE</span><h3 id="videoModalTitle">当 MBTI 遇见 DDL：王朝嗨茶酒短视频广告</h3></div><video id="caseVideoPlayer" controls playsInline preload="metadata" /></div></div>      <section className="contactFinal sectionPanel" id="contact"><div className="container contactInner reveal"><span className="pill darkPill">联系</span><h2>欢迎从一个想法开始联系我</h2><p>关于品牌、内容、影像，或一个正在成形的项目。</p><div className="contactActions"><a href="mailto:contact@example.com">发送邮件</a><a href="#home">回到顶部 ↗</a></div></div></section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);











